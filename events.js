var auth = firebase.auth();
var firestore = firebase.firestore();

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


document.addEventListener("DOMContentLoaded", function () {
  // Load the event data from the JSON file
  fetch("event_info.json")
    .then((response) => response.json())
    .then((data) => {
      // Get the container to display the event information
      const eventsContainer = document.querySelector(".events-container");

      // Loop through the event data and create elements to display them
      data.forEach((event) => {
        const eventElement = document.createElement("div");
        eventElement.classList.add("event");

        eventElement.innerHTML = `
          <h3>${event.name}</h3>
          <p>Date: ${event.date}</p>
          <p>Location: ${event.streetAddress}</p>
          <p>Description: ${event.description}</p>
          <div id="event-links">
            <a href="${event.url}" target="_blank">Learn More</a>
            <button class="create-group-button" data-event-name="${event.name}">Create Group for this Event</button>
          </div>

        `;
        console.log(eventElement.innerHTML);
        eventsContainer.appendChild(eventElement);

        // Add a click event listener to the "Create Group" button
        const createGroupButton = eventElement.querySelector(".create-group-button");
        createGroupButton.addEventListener("click", function () {
          createGroup(event.name);
        });
      });
    })
    .catch((error) => {
      console.error("Error loading event data:", error);
    });
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