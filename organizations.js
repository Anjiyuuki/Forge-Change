const apiKey = 'AIzaSyD4KuTAPjAWrncz7ayMNvxhbMMIPQAbMTA';
var organizations = [];
var auth = firebase.auth();
const firestore = firebase.firestore();
markers = [];

// Get the current page's filename
const currentPage = window.location.pathname.split('/').pop();

// Remove the 'active' class from all navigation links
document.querySelectorAll('.nav-link').forEach(link => {
  link.classList.remove('active');
});

// Highlight the active tab based on the current page
document.querySelectorAll('.nav-link').forEach(link => {
  const linkPage = link.getAttribute('href');
  if (linkPage === currentPage) {
    link.classList.add('active');
  }
});

function getLocationCoordinates(location) {
  // Define coordinates for specified locations
  const locationCoordinates = {
    "Greenville": { lat: 34.8526, lng: -82.3940 },
    "Charleston": { lat: 32.7765, lng: -79.9311 },
    "Columbia": { lat: 34.0007, lng: -81.0348 },
  };

  return locationCoordinates[location] || null;
}

async function initMap() {
  // Request needed libraries.
  //@ts-ignore
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  // The map, centered at South Carolina by default
  const defaultPosition = { lat: 33.8361, lng: -81.1637 }; // Center of South Carolina
  let map = new Map(document.getElementById("organizations-map"), {
    zoom: 7,
    center: defaultPosition,
    mapId: "DEMO_MAP_ID",
  });

  auth.onAuthStateChanged(function(user) {
    // Check if the user is logged in
    if (user) {
      firestore.collection("users")
        .doc(user.uid)
        .get()
        .then(function (doc) {
          if (doc.exists) {
            var userData = doc.data();
            const userLocation = userData.location;
            // Center the map at the user's location if it's one of the specified cities
            if (["Greenville", "Charleston", "Columbia"].includes(userLocation)) {
              const userPosition = getLocationCoordinates(userLocation);
              map.setCenter(userPosition);
              map.setZoom(10);
            }
          }
        })
        .catch(function (error) {
          console.error("Error fetching user data:", error);
        });
    }
  });
  
  activeButton('All');
  let infoWindows = [];
  
  const topics = ['All', 'Animals', 'Education', 'Environment', 'LGBTQ+', 'Humanitarian', 'Suggested'];
  topics.forEach(topic => {
    document.getElementById(`filter${topic}`).addEventListener("click", function () {
      activeButton(topic);
      if (topic === 'LGBTQ+') {
        filterVolunteerOrganizations('LGBTQ+');
      } else if (topic === 'Suggested') {
        getSuggestedOrganizations();
      } else {
        filterVolunteerOrganizations(topic.toLowerCase());
      }
    });
  });
  
  function activeButton(topic) {
    // Remove the 'active' class from all filter buttons
    document.querySelectorAll('.filter-button').forEach(button => {
      button.classList.remove('active');
    });
  
    // Add the 'active' class to the currently selected filter button
    const activeButton = document.querySelector(`button[topic="${topic}"]`);
    if (activeButton) {
      activeButton.classList.add('active');
    }
  
  }

  function filterVolunteerOrganizations(topic) {
  
    const filteredOrganizations = organizations.filter(org => {
      const keywordMatch = topic === 'all' || org.keyword === topic;
  
      return keywordMatch;
    });
    displayVolunteerOrganizations(filteredOrganizations);
  }
  

  async function getSuggestedOrganizations() {
    auth.onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in, retrieve user's name
        firestore.collection('users').doc(user.uid).get()
          .then(function (doc) {
            if (doc.exists) {
              var userData = doc.data();
              var userInterests = userData.interests;
  
              var suggestedOrganizations = organizations.filter(org => {
                const locationMatch = ['Charleston', 'Greenville', 'Columbia'].includes(userData.location)
                  ? org.location === userData.location
                  : true;
                return userInterests.includes(org.keyword) && locationMatch;
              });
  
              // Call the function to display suggested organizations
              displaySuggestedOrganizations(suggestedOrganizations);
            } else {
              console.log('User data not found');
            }
          })
          .catch(function (error) {
            console.log('Error getting user data:', error);
          });
      } else {
        // User is not logged in, display a message
        const suggestedList = document.querySelector('.volunteer-list');
        suggestedList.innerHTML = '<li>Login or create an account to get suggested organizations.</li>';
      }
    });
  }
  // Function to display suggested organizations
  function displaySuggestedOrganizations(suggestedOrganizations) {
    const suggestedList = document.querySelector('.volunteer-list');
    suggestedList.innerHTML = '';
    // Clear map markers
    for (let i = 0; i < infoWindows.length; i++) {
      infoWindows[i].close();
    }
    infoWindows = []; 
    if (map) {
      map.data.forEach(function (feature) {
        map.data.remove(feature);
      });
    }
    markers.forEach(function(marker) {
      marker.setMap(null);
    });

    if (suggestedOrganizations.length === 0) {
      suggestedList.innerHTML = '<li>No suggested organizations based on your interests.</li>';
    } else {
      suggestedOrganizations.forEach(org => {
        const listItem = document.createElement('li');
        listItem.style.marginBottom = '10px';
        listItem.style.padding = '10px';
        listItem.style.border = '1px solid #ccc';
        listItem.style.borderRadius = '5px';
        listItem.style.background = '#f4f7e1';
        listItem.style.color = '#333';
        listItem.style.fontSize = '16px';

        listItem.innerHTML = `<strong>Name:</strong> ${org.name}
                              <br><strong>Location:</strong> ${org.location}
                              <br><strong>Topic:</strong> ${org.keyword}
                              <br><strong>Website:</strong> <a href="${org.website}">${org.website}</a>`;

        suggestedList.appendChild(listItem);
        const orgMarker = new google.maps.Marker({
          position: org.position,
          map: map,
          title: org.name,
        });
        markers.push(orgMarker);
        const infoWindow = new google.maps.InfoWindow({
          content: `<a href="${org.website}" target="_blank">${org.name}</a>`,
       });
      
        orgMarker.addListener('click', () => {
          infoWindows.forEach(iw => iw.close());
          infoWindow.open(map, orgMarker);
        });
      
        infoWindows.push(infoWindow);
      });
    }
  }
  async function getOrganizationsFromFirestore() {
    try {
      const querySnapshot = await firestore.collection('organizations').get();
      organizations = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          name: data.name,
          position: { lat: data.lat, lng: data.lng }, // Assuming you store latitude and longitude in Firestore
          keyword: data.keyword,
          location: data.city,
          website: data.website
        };
      });

      // Call the function to display organizations
      displayVolunteerOrganizations(organizations);

    } catch (error) {
      console.error('Error getting organizations from Firestore:', error);
    }
  }

  // Call the function to get organizations when the page loads
  getOrganizationsFromFirestore();

  // Function to display filtered volunteer organizations
  function displayVolunteerOrganizations(organizations) {
    const keywordMarkerColors = {
      "animals": "red",
      "environment": "green",
      "LGBTQ+": "yellow",
      "education": "blue",
      "humanitarian": "orange",
        // Add more keywords and their corresponding colors as needed
      };
    const volunteerList = document.querySelector('.volunteer-list');
    volunteerList.innerHTML = '';

    if (organizations.length === 0) {
      volunteerList.innerHTML = '<li>No results found.</li>';
    } else {
      organizations.forEach(org => {
       
        const listItem = document.createElement('li');
        listItem.style.marginBottom = '10px';
        listItem.style.padding = '10px';
        listItem.style.border = '1px solid #ccc';
        listItem.style.borderRadius = '5px';
        listItem.style.background = '#f4f7e1';
        listItem.style.color = '#333';
        listItem.style.fontSize = '16px';

        listItem.innerHTML = `<strong>Name:</strong> ${org.name}
                              <br><strong>Location:</strong> ${org.location}
                              <br><strong>Topic:</strong> ${org.keyword}
                              <br><strong>Website:</strong> <a href="${org.website}">${org.website}</a>`;

        volunteerList.appendChild(listItem);

        
      // Clear map markers
      for (let i = 0; i < infoWindows.length; i++) {
        infoWindows[i].close();
      }
      infoWindows = []; 
      if (map) {
        map.data.forEach(function (feature) {
          map.data.remove(feature);
        });
      }
      markers.forEach(function(marker) {
        marker.setMap(null);
      });

      // Create markers and info windows for each organization
      organizations.forEach(org => {
         // Get the marker color based on the organization's keyword
      const markerColor = keywordMarkerColors[org.keyword] || "default";

      // Define a function to get the marker icon URL based on color
      function getMarkerIconUrl(color) {
        return `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`;
      }
        const orgMarker = new google.maps.Marker({
          position: org.position,
          map: map,
          title: org.name,
          icon: {
            url: getMarkerIconUrl(markerColor),
            scaledSize: new google.maps.Size(30, 30), // Adjust the size as needed
          },
        });
        markers.push(orgMarker);
        const infoWindow = new google.maps.InfoWindow({
          content: `<a href="${org.website}" target="_blank">${org.name}</a>`,
        });
  
        orgMarker.addListener('click', () => {
          infoWindows.forEach(iw => iw.close());
          infoWindow.open(map, orgMarker);
        });
  

        infoWindows.push(infoWindow);
      });
      

      });
    }
  }
}


// Function to handle sign-out confirmation
function handleSignOutConfirmation() {
  const confirmationMessage = document.getElementById('signOutButton').getAttribute('data-confirm');
  if (confirm(confirmationMessage)) {
    // User clicked "OK," sign them out
    signOut();
  }
}

// Function to sign out the user and redirect to the index page
function signOut() {
  firebase.auth().signOut().then(() => {
    // Sign-out successful, redirect to the index page
    window.location.href = 'index.html';
  }).catch((error) => {
    // An error occurred while signing out
    console.error('Sign-out error:', error);
  });
}


// Add an event listener to the sign-out button
document.getElementById('signOutButton').addEventListener('click', handleSignOutConfirmation);