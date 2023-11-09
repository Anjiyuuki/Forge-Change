var auth = firebase.auth();
var firestore = firebase.firestore();
const apiKey = 'AIzaSyD4KuTAPjAWrncz7ayMNvxhbMMIPQAbMTA';
var events = [];
var map;
let infoWindows = [];

async function initMap() {
  // The location of Uluru
  const position = { lat: 32.7767, lng: -79.9301 };
  // Request needed libraries.
  //@ts-ignore
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  // The map, centered at Uluru
  map = new Map(document.getElementById("events-map"), {
    zoom: 9,
    center: position,
    mapId: "DEMO_MAP_ID",
  });
    // Load the event data from the JSON file
    fetch("event_info.json")
      .then((response) => response.json())
      .then((data) => {
        // Get the list to display the event information
        const eventsList = document.querySelector(".events-list");
  
        // Loop through the event data and create elements to display them
        data.forEach((event) => {
          const eventElement = document.createElement("div");
          eventElement.classList.add("event");
  
          eventElement.innerHTML = `
            <h3>${event.name}</h3>
            <p>Date: ${event.date}</p>
            <p>Location: ${event.address}</p>
            <p>Description: ${event.description}</p>
            <div id="event-links">
              <a href="${event.url}" target="_blank">Learn More</a>
              <button class="create-group-button" data-event-name="${event.name}">Create Group for this Event</button>
            </div>
  
          `;
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