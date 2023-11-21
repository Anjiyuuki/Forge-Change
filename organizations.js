const apiKey = 'AIzaSyD4KuTAPjAWrncz7ayMNvxhbMMIPQAbMTA';
var organizations = [];
var auth = firebase.auth();
const firestore = firebase.firestore();
markers = [];
var map; // Define map globally
const currentPage = window.location.pathname.split('/').pop();
var userLocation;
var defaultPosition;

// Remove the 'active' class from all navigation links and add it to the current page
document.querySelectorAll('.nav-link').forEach(link => {
  link.classList.remove('active');
});
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
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  // Center map at SC by default
  defaultPosition = { lat: 33.8361, lng: -81.1637 };
  map = new Map(document.getElementById("organizations-map"), {
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
            userLocation = userData.location;
            // Center the map at the user's location if it's one of the specified cities
            
          }
        })
        .catch(function (error) {
          console.error("Error fetching user data:", error);
        });
    }
  });
  
  activeButton('All');
  let infoWindows = [];
  
  // Filter organizations if user clicks on topic buttons
  const topics = ['All', 'Animals', 'Education', 'Environment', 'LGBTQ+', 'Humanitarian', 'Suggested'];
  topics.forEach(topic => {
    document.getElementById(`filter${topic}`).addEventListener("click", function () {
      clearMapMarkers(); // Clear existing markers
      activeButton(topic);
  
      if (topic === 'Suggested') {
        getSuggestedOrganizations();
        const userPosition = getLocationCoordinates(userLocation);
        map.setCenter(userPosition);
        map.setZoom(10);
      } else if (topic === 'All') {
        infoWindows.forEach(iw => iw.close());
        // Zoom out to show the whole state
        map.setCenter(defaultPosition);
        map.setZoom(7);
        getOrganizationsFromFirestore();
        activeButton('All');
        filterVolunteerOrganizations(topic.toLowerCase());
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
      // User is signed in, retrieve user's data
      firestore.collection('users').doc(user.uid).get()
        .then(function (doc) {
          if (doc.exists) {
            var userData = doc.data();
            var userInterests = userData.interests.map(interest => interest.toLowerCase());

            // Filter organizations based on user's interests and location
            var suggestedOrganizations = organizations.filter(org => {
              const locationMatch = ['Charleston', 'Greenville', 'Columbia'].includes(userData.location)
                ? org.location === userData.location
                : true;
              return userInterests.includes(org.keyword.toLowerCase()) && locationMatch;
            });
            displaySuggestedOrganizations(suggestedOrganizations);
          } else {
            console.log('User data not found');
          }
        })
        .catch(function (error) {
          console.log('Error getting user data:', error);
        });
    } else {
      const suggestedList = document.querySelector('.volunteer-list');
      suggestedList.innerHTML = '<li>Login or create an account to get suggested organizations.</li>';
    }
  });
}

// Function to display suggested organizations
function displaySuggestedOrganizations(suggestedOrganizations) {
  const keywordMarkerColors = {
    "animals": "red",
    "environment": "green",
    "lgbtq+": "yellow",
    "education": "blue",
    "humanitarian": "orange",
  };
  const volunteerList = document.querySelector('.volunteer-list');
  volunteerList.innerHTML = '';
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

  // Create displays for each organization
  if (suggestedOrganizations.length === 0) {
    suggestedList.innerHTML = '<li>No suggested organizations based on your interests.</li>';
  } else { 
    suggestedOrganizations.forEach(org => {
    const listItem = document.createElement('li');
    listItem.className = 'volunteer-list-item';
    listItem.innerHTML = `<div id="orgName">${org.name}</div>
      <br><strong>Region:</strong> ${org.location}
      <br><strong>Topic:</strong> ${org.keyword === 'lgbtq+' ? 'LGBTQ+' : org.keyword.toLowerCase()}
      <br><strong>Website:</strong> <a href="${org.website}" class="website-link">${org.website}</a>`;
      suggestedList.appendChild(listItem);

      // Get the marker color based on the organization's keyword
      const markerColor = keywordMarkerColors[org.keyword] || "default";
      function getMarkerIconUrl(color) {
        return `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`;
      }

      // Create markers and info windows for each organization
      const orgMarker = new google.maps.Marker({
        position: org.position,
        map: map,
        title: org.name,
        icon: {
          url: getMarkerIconUrl(markerColor),
          scaledSize: new google.maps.Size(30, 30),
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

      // Add click event listener to the organization list item
      listItem.addEventListener('click', () => {
        // Center the map on the clicked organization
        map.setCenter(orgMarker.getPosition());
        map.setZoom(15); // You can adjust the zoom level as needed
        google.maps.event.trigger(orgMarker, 'click');

      });
      });
  }
}

// Function to get organization info from Firestore
async function getOrganizationsFromFirestore() {
  try {
    const querySnapshot = await firestore.collection('organizations').get();
    organizations = querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Ensure the necessary properties exist before accessing them
      const name = data.name || '';
      const lat = data.lat || 0;
      const lng = data.lng || 0;
      const city = data.city || '';
      const website = data.website || '';
      // Convert keyword to lowercase if it exists, otherwise, use an empty string
      const keyword = data.keyword ? data.keyword.toLowerCase() : '';
      // Return an object with the organization's name, position, keyword, location, and website
      return {
        name: name,
        position: { lat: lat, lng: lng },
        keyword: keyword,
        location: city,
        website: website
      };
    });
    displayVolunteerOrganizations(organizations);

  } catch (error) {
    console.error('Error getting organizations from Firestore:', error);
  }
}

getOrganizationsFromFirestore();

// Function to display filtered volunteer organizations
function displayVolunteerOrganizations(organizations) {
  clearMapMarkers(); // Clear existing markers

  const keywordMarkerColors = {
    "animals": "red",
    "environment": "green",
    "lgbtq+": "yellow",
    "education": "blue",
    "humanitarian": "orange",
  };

  const volunteerList = document.querySelector('.volunteer-list');
  volunteerList.innerHTML = '';

  if (organizations.length === 0) {
    volunteerList.innerHTML = '<li>No results found.</li>';
  } else {
    // Create displays for each organization
    organizations.forEach(org => {
      const listItem = document.createElement('li');
      listItem.className = 'volunteer-list-item';
      listItem.innerHTML = `<div id="orgName">${org.name}</div>
        <br><strong>Region:</strong> ${org.location}
        <br><strong>Topic:</strong> ${org.keyword === 'lgbtq+' ? 'LGBTQ+' : org.keyword.toLowerCase()} 
        <br><strong>Website:</strong> <a href="${org.website}" class="website-link">${org.website}</a>`;
      volunteerList.appendChild(listItem);

      // Get the marker color based on the organization's keyword
      const markerColor = keywordMarkerColors[org.keyword] || "default";
      function getMarkerIconUrl(color) {
        return `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`;
      }

      // Create markers and info windows for each organization
      const orgMarker = new google.maps.Marker({
        position: org.position,
        map: map,
        title: org.name,
        icon: {
          url: getMarkerIconUrl(markerColor),
          scaledSize: new google.maps.Size(30, 30),
        },
      });

      markers.push(orgMarker);

      const infoWindow = new google.maps.InfoWindow({
        content: `<a href="${org.website}" target="_blank">${org.name}</a>`,
      });

      orgMarker.addListener('click', () => {
        // Close all other info windows
        infoWindows.forEach(iw => iw.close());

        // Open the info window for the clicked marker
        infoWindow.open(map, orgMarker);
      });

      infoWindows.push(infoWindow);

      // Add click event listener to the organization list item
      listItem.addEventListener('click', () => {
        // Center the map on the clicked organization
        map.setCenter(orgMarker.getPosition());
        map.setZoom(15); // You can adjust the zoom level as needed
        google.maps.event.trigger(orgMarker, 'click');
      });
    });
  }
}

document.getElementById('organizationSearch').addEventListener('input', function () {
  const searchValue = this.value.toLowerCase();
  const filteredOrganizations = organizations.filter(org => {
    // Check if org.name is defined and not null before accessing it
    return org.name && org.name.toLowerCase().includes(searchValue);
  });
  displayVolunteerOrganizations(filteredOrganizations);
});
}


// Function to handle sign-out confirmation
function handleSignOutConfirmation() {
  const confirmationMessage = document.getElementById('signOutButton').getAttribute('data-confirm');
  if (confirm(confirmationMessage)) {
    signOut();
  }
}

// Function to sign out the user and redirect to the index page
function signOut() {
  firebase.auth().signOut().then(() => {
    // Sign-out successful, redirect to the index page
    window.location.href = 'index.html';
  }).catch((error) => {
    console.error('Sign-out error:', error);
  });
}
// Add an event listener to the sign-out button
document.getElementById('signOutButton').addEventListener('click', handleSignOutConfirmation);

function clearMapMarkers() {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
}