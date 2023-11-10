var auth = firebase.auth();
var firestore = firebase.firestore();
const apiKey = 'AIzaSyD4KuTAPjAWrncz7ayMNvxhbMMIPQAbMTA';
var events = [];
var map;
let infoWindows = [];
var markers = [];

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

  // The map, centered at South Carolina by default
  const defaultPosition = { lat: 33.8361, lng: -81.1637 }; // Center of South Carolina
  map = new Map(document.getElementById("events-map"), {
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
// Define an array of cities
const cities = ["Charleston", "Greenville", "Columbia", "All"];

// Add event listener for each filter button
cities.forEach(city => {
  document.getElementById(`filter${city}`).addEventListener("click", function () {
    getEvents(city);
    activeButton(city);

    const currentCity = getLocationCoordinates(city);
    map.setCenter(currentCity);
    map.setZoom(10);
    if (city === "All") {
      getEvents("all");
      map.setCenter(defaultPosition);
      map.setZoom(6);
    }
  });
});

  // Call getEvents with a default file when the page loads
  getEvents("all");
  activeButton("All");
}

function activeButton(city) {
  // Remove the 'active' class from all filter buttons
  document.querySelectorAll('.filter-button').forEach(button => {
    button.classList.remove('active');
  });

  // Add the 'active' class to the currently selected filter button
  const activeButton = document.querySelector(`button[id="filter${city}"]`);
  if (activeButton) {
    activeButton.classList.add('active');
  }

}

function getEvents(city) {
  // Clear the events list
  const eventsList = document.querySelector(".events-list");
  eventsList.innerHTML = "";

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

  // Load all events from the JSON file
  fetch("events_info.json")
    .then((response) => response.json())
    .then((data) => {
      // Filter events based on the specified city
      const filteredEvents = city === "all" ? data : data.filter(event => event.city === city);
      // Loop through the filtered event data and create elements to display them
      filteredEvents.forEach((event) => {
        const eventElement = document.createElement("div");
        eventElement.classList.add("event");
        eventElement.innerHTML = `
          <h3>${event.name}</h3>
          <p><strong>Date:</strong> ${event.date}</p>
          <p><strong>Location:</strong> ${event.location.name} (${event.location.address.streetAddress}, ${event.location.address.addressLocality}, 
             ${event.location.address.addressRegion} ${event.location.address.postalCode})</p>
          <p><strong>Description:</strong> ${event.description}</p>
          <div id="event-links">
            <a href="${event.url}" target="_blank">Learn More</a>
            <button class="create-group-button" data-event-name="${event.name}">Create Group for this Event</button>
          </div>`;
        eventsList.appendChild(eventElement);

        // Add a click event listener to the "Create Group" button
        const createGroupButton = eventElement.querySelector(".create-group-button");
        createGroupButton.addEventListener("click", function () {
          createGroup(event.name);
        });
        var eventMarker = new google.maps.Marker({
          position: { lat: event.position.lat, lng: event.position.lng },
          map: map,
          title: event.name,
        });
        markers.push(eventMarker);
        var contentInfo = `<strong>${event.name}</strong>
        <br>
        <a href='${event.url}' target='_blank'>More details</a>`
        const infoWindow = new google.maps.InfoWindow({
          content: contentInfo
        });

        eventMarker.addListener('click', () => {
          infoWindows.forEach(iw => iw.close());
          infoWindow.open(map, eventMarker);
        });

        infoWindows.push(infoWindow);
      });
    })
    .catch((error) => {
      console.error("Error loading event data:", error);
    });
}

// Function to sign out the user and redirect to the index page
function signOut() {
  firebase.auth().signOut().then(function () {
      // Sign-out successful, redirect to the index page
      window.location.href = 'index.html';
  }).catch(function (error) {
      // An error occurred while signing out
      console.error('Sign-out error:', error);
  });
}

// Function to sign out the user and redirect to the index page
function signOut() {
    firebase.auth().signOut().then(function () {
        // Sign-out successful, redirect to the index page
        window.location.href = 'index.html';
    }).catch(function (error) {
        // An error occurred while signing out
        console.error('Sign-out error:', error);
    });
}

// Event listener for the sign-out button
var signOutButton = document.querySelector('#signOutButton');
signOutButton.addEventListener('click', function () {
    // Confirm the sign-out action
    var confirmationMessage = signOutButton.getAttribute('data-confirm');
    if (confirm(confirmationMessage)) {
        // User clicked "OK," sign them out
        signOut();
    }
});

// Function to create a group for the specified event
function createGroup(eventName) {
  var user = firebase.auth().currentUser;
  var username;

  if (user) {
    firestore.collection("users")
      .doc(user.uid)
      .get()
      .then(function (doc) {
        if (doc.exists) {
          var userData = doc.data();
          username = userData.username;

          // Create a new group with the event name as the title
          firestore.collection("groups")
            .doc(eventName)
            .set({
              title: eventName,
              category: "event"
            })
            .then((docRef) => {
              // Add the current user to the members list of the newly created group
              return firestore.collection("groups")
                .doc(eventName)
                .collection("members")
                .doc(user.uid)
                .set({
                  userId: user.uid,
                  username: username,
                });
            })
            .then(() => {
              // Successfully created the group and added the user
              alert("Group for the event has been created.");
            })
            .catch((error) => {
              console.error("Error creating group:", error);
            });
        } else {
          console.log("User data not found");
          return Promise.reject("User data not found");
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  } else {
    // User is not logged in
    alert("Please log in to create a group for the event.");
  }
}