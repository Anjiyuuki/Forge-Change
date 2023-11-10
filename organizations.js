const apiKey = 'AIzaSyD4KuTAPjAWrncz7ayMNvxhbMMIPQAbMTA';
var organizations = [];
var auth = firebase.auth();
const firestore = firebase.firestore();

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

async function initMap() {
  // The location of Uluru
  const position = { lat: 32.7767, lng: -79.9301 };
  // Request needed libraries.
  //@ts-ignore
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  // The map, centered at Uluru
  let map = new Map(document.getElementById("organizations-map"), {
    zoom: 12,
    center: position,
    mapId: "DEMO_MAP_ID",
  });
  let infoWindows = [];

  // Function to get suggested organizations based on user interests
  async function getSuggestedOrganizations() {
  auth.onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in, retrieve user's name
      firestore.collection('users').doc(user.uid).get()
        .then(function(doc) {
          if (doc.exists) {
            var userData = doc.data();
            var userInterests = userData.interests;
            var locationFilter = document.getElementById('locationFilter').value; // Get the selected location

            var suggestedOrganizations = organizations.filter(org => {
              return userInterests.includes(org.keyword) && (locationFilter === 'all' || org.location === locationFilter);
            });

            // Call the function to display suggested organizations
            displaySuggestedOrganizations(suggestedOrganizations);
          } else {
            console.log('User data not found');
          }
        })
        .catch(function(error) {
          console.log('Error getting user data:', error);
        });
    }
  });
}
  // Function to display suggested organizations
  function displaySuggestedOrganizations(suggestedOrganizations) {
    const suggestedList = document.querySelector('.volunteer-list');
    suggestedList.innerHTML = '';

  // Remove the 'active' class from all filter buttons
  document.querySelectorAll('.filter-button').forEach(button => {
    button.classList.remove('active');
  });
  // Add the 'active' class to the currently selected filter button
  const activeButton = document.querySelector(`button[data-keyword="suggested"]`);
  if (activeButton) {
    activeButton.classList.add('active');
  }

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

      // Define a mapping of keywords to marker colors
  const keywordMarkerColors = {
    "animals": "red",
    "environment": "green",
    "LGBTQ+": "yellow",
    "education": "blue",
    "humanitarian": "orange",
      // Add more keywords and their corresponding colors as needed
    };

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

      const infoWindow = new google.maps.InfoWindow({
        content: `<a href="${org.website}" target="_blank">${org.name}</a>`,
      });

      orgMarker.addListener('click', () => {
        infoWindows.forEach(iw => iw.close());
        infoWindow.open(map, orgMarker);
      });

      infoWindows.push(infoWindow);
    });
  } catch (error) {
    console.error('Error getting organizations from Firestore:', error);
    }
  }

  // Call the function to get organizations when the page loads
  getOrganizationsFromFirestore();

  // Function to display filtered volunteer organizations
  function displayVolunteerOrganizations(organizations) {
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
      });
    }
  }
  
  function filterVolunteerOrganizations() {
    const locationFilter = document.getElementById('locationFilter').value;
    const keywordFilter = document.getElementById('keywordFilter').value;

    // Remove the 'active' class from all filter buttons
    document.querySelectorAll('.filter-button').forEach(button => {
      button.classList.remove('active');
    });
    // Add the 'active' class to the currently selected filter button
    const activeButton = document.querySelector(`button[data-keyword="${keywordFilter}"]`);
    if (activeButton) {
      activeButton.classList.add('active');
    }
  
    const filteredOrganizations = organizations.filter(org => {
      const locationMatch = locationFilter === 'all' || org.location === locationFilter;
      const keywordMatch = keywordFilter === 'all' || org.keyword === keywordFilter;
      
      return locationMatch && keywordMatch;
    });
  
    displayVolunteerOrganizations(filteredOrganizations);
  }
  
  // Add event listeners to filters and keyword input
  document.getElementById('locationFilter').addEventListener('change', filterVolunteerOrganizations);
  document.getElementById('keywordFilter').addEventListener('change', filterVolunteerOrganizations);
  
  document.querySelectorAll('.filter-button').forEach(button => {
    button.addEventListener('click', function () {
      const keyword = this.getAttribute('data-keyword');
      document.getElementById('keywordFilter').value = keyword;
  
      // If "suggested" tab is clicked, call getSuggestedOrganizations
      if (keyword === 'suggested') {
        getSuggestedOrganizations();
      } else {
        filterVolunteerOrganizations();
      }
    });
  });
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