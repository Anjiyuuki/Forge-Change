var firestore = firebase.firestore();
var auth = firebase.auth();
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

auth.onAuthStateChanged(function(user) {
    if (user) {
        // User is signed in, retrieve user's name
        firestore.collection('users').doc(user.uid).get()
            .then(function(doc) {
                if (doc.exists) {
                    var userData = doc.data();
                    var userName = userData.name;
                    var userLocation = userData.location;
                    var userHours = userData.hours;
                    var userInterests = userData.interests;
                    // Update the user's name in the profile
                    document.getElementById('user-name').textContent = userName;
                    document.getElementById('user-location').textContent = userLocation;
                    document.getElementById('user-interests').textContent = userInterests;
                    document.getElementById('user-hours').textContent = userHours;
                } else {
                    console.log('User data not found');
                }
            })
            .catch(function(error) {
                console.log('Error getting user data:', error);
            });
    } else {
        // User is not signed in, handle this case if needed
    }
});

// JavaScript code in explore.js
function uploadProfilePicture() {
    const profilePicture = document.getElementById('profile-picture-upload');
    // Handle profile picture upload here (e.g., save the uploaded image).
    // Update the "profile-picture" element with the new image source.
}

// Function to handle sign-out confirmation
function handleSignOutConfirmation() {
  console.log("signout");
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

// Get a reference to the edit profile button and the modal
const editProfileButton = document.getElementById('editProfileButton');
const editProfileModal = document.getElementById('editProfileModal');
const closeModalButton = document.getElementById('closeModal');

editProfileButton.addEventListener('click', () => {
  // Set the size and other properties for the popup window
  const width = 400;
  const height = 500;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;

  // Open a new popup window
  const editProfileWindow = window.open('', 'EditProfileWindow', `width=${width},height=${height},left=${left},top=${top}`);

  // Set the HTML content for the popup window
  const popupContent = `
      <html>
      <head>
          <title>Edit Profile</title>
          <style>
              /* Add your popup window styles here */
              body {
                  font-family: Arial, sans-serif;
              }
              .container {
                  text-align: center;
                  padding: 20px;
              }
              /* Add your CSS styles here */
          </style>
      </head>
      <body>
          <div class="container">
              <span class="close" id="closeModal" style="cursor: pointer;">&times;</span>
              <h2>Edit Profile</h2>
              <!-- Add form elements to edit user information -->
              <form id="profileEditForm">
                  <label for="newName">Name:</label>
                  <input type="text" id="newName">
                  <label for="newUsername">Username:</label>
                  <input type="text" id="newUsername">
                  <label for="newEmail">Email:</label>
                  <input type="email" id="newEmail">
                  <label for="newPassword">New Password:</label>
                  <input type="password" id="newPassword">
                  <label for="confirmPassword">Confirm Password:</label>
                  <input type="password" id="confirmPassword">
                  <label for="newInterests">Interests:</label>
                  <input type="text" id="newInterests">
                  <label for="newLocation">Location:</label>
                  <input type="text" id="newLocation">
                  <button type="button" id="submitChangesButton">Submit Changes</button>
              </form>
          </div>
          <script src="info.js"></script>
      </body>
      </html>
  `;

  editProfileWindow.document.open();
  editProfileWindow.document.write(popupContent);
  editProfileWindow.document.close();

  // Handle closing of the popup window
  editProfileWindow.document.getElementById('closeModal').addEventListener('click', () => {
      editProfileWindow.close();
  });
});

// Add an event listener to close the modal when the close button is clicked
closeModalButton.addEventListener('click', () => {
    editProfileModal.style.display = 'none';
});

// Add an event listener to close the modal when the user clicks outside the modal
window.addEventListener('click', (event) => {
    if (event.target == editProfileModal) {
        editProfileModal.style.display = 'none';
    }
});

const profileEditForm = document.getElementById('profileEditForm');
const submitChangesButton = document.getElementById('submitChangesButton');

// Add an event listener to handle form submission
submitChangesButton.addEventListener('click', () => {
  var user = firebase.auth().currentUser;
  if (user) {
      const newName = document.getElementById('newName').value;
      const newUsername = document.getElementById('newUsername').value;
      const newEmail = document.getElementById('newEmail').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const newInterests = document.getElementById('newInterests').value;
      const newLocation = document.getElementById('newLocation').value;

      // Check if the new password and confirm password match
      if (newPassword !== confirmPassword) {
          alert('New password and confirm password do not match.');
          return;
      }

      // Create an object to store the fields to update
      const fieldsToUpdate = {};

      if (newName) {
          fieldsToUpdate.name = newName;
      }

      if (newUsername) {
          fieldsToUpdate.username = newUsername;
      }

      if (newEmail) {
          fieldsToUpdate.email = newEmail;
      }

      if (newInterests) {
          fieldsToUpdate.interests = newInterests;
      }

      if (newLocation) {
          fieldsToUpdate.location = newLocation;
      }

      // Only update the user's information in Firestore if there are fields to update
      if (Object.keys(fieldsToUpdate).length > 0) {
          const userRef = firestore.collection('users').doc(user.uid);
          userRef.update(fieldsToUpdate)
              .then(() => {
                  // Close the modal and update the displayed information on the page
                  editProfileModal.style.display = 'none';
                  if (fieldsToUpdate.name) {
                      document.getElementById('user-name').textContent = fieldsToUpdate.name;
                  }
                  if (fieldsToUpdate.location) {
                      document.getElementById('user-location').textContent = fieldsToUpdate.location;
                  }
                  if (fieldsToUpdate.interests) {
                      document.getElementById('user-interests').textContent = fieldsToUpdate.interests;
                  }
              })
              .catch((error) => {
                  console.error('Error updating user information:', error);
              });
      } else {
          alert('No fields to update. Please enter information in at least one field.');
      }
  }
});

document.getElementById('addHoursButton').addEventListener('click', function() {
  var user = firebase.auth().currentUser;
  console.log("10");
  if (user) {
    var userID = user.uid;
    // Add 10 hours to the user's volunteer hours
    firestore.collection('users').doc(userID).get()
      .then(function(doc) {
        if (doc.exists) {
          var userData = doc.data();
          var currentHours = userData.hours || 0;
          var newHours = currentHours + 10;

          // Update the user's volunteer hours in the Firestore database
          firestore.collection('users').doc(userID).update({
            hours: newHours
          })
          .then(function() {
            // Update the displayed volunteer hours on the page
            document.getElementById('user-hours').textContent = newHours;
            console.log('Volunteer hours updated successfully.');
          })
          .catch(function(error) {
            console.error('Error updating volunteer hours: ', error);
          });
        } else {
          console.log('User data not found');
        }
      })
      .catch(function(error) {
        console.error('Error getting user data:', error);
      });
  }
});

function openForm(formId) {
  document.getElementById(formId).style.display = "block";
}

// Function to close the popup form
function closeForm(formId) {
  document.getElementById(formId).style.display = "none";
}

// Function to submit profile changes (similar to the submitChangesButton click handler)
function submitProfileChanges() {
  var user = firebase.auth().currentUser;
  if (user) {
    const newName = document.getElementById('newName').value;
    const newUsername = document.getElementById('newUsername').value;
    const newEmail = document.getElementById('newEmail').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const newInterests = document.getElementById('newInterests').value;
    const newLocation = document.getElementById('newLocation').value;

    // Check if the new password and confirm password match
    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }

    // Create an object to store the fields to update
    const fieldsToUpdate = {};

    if (newName) {
      fieldsToUpdate.name = newName;
    }

    if (newUsername) {
      fieldsToUpdate.username = newUsername;
    }

    if (newEmail) {
      fieldsToUpdate.email = newEmail;
    }

    if (newInterests) {
      fieldsToUpdate.interests = newInterests;
    }

    if (newLocation) {
      fieldsToUpdate.location = newLocation;
    }

    // Only update the user's information in Firestore if there are fields to update
    if (Object.keys(fieldsToUpdate).length > 0) {
      const userRef = firestore.collection('users').doc(user.uid);
      userRef.update(fieldsToUpdate)
        .then(() => {
          // Close the modal and update the displayed information on the page
          closeForm('editProfileForm');

          if (fieldsToUpdate.name) {
            document.getElementById('user-name').textContent = fieldsToUpdate.name;
          }

          if (fieldsToUpdate.location) {
            document.getElementById('user-location').textContent = fieldsToUpdate.location;
          }

          if (fieldsToUpdate.interests) {
            document.getElementById('user-interests').textContent = fieldsToUpdate.interests;
          }
        })
        .catch((error) => {
          console.error('Error updating user information:', error);
        });
    } else {
      alert('No fields to update. Please enter information in at least one field.');
    }
  }
}