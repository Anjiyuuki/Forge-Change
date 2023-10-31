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
      var userID = user.uid;
    var volunteerHistoryTable = document.getElementById('volunteerHistoryTable');
    var volunteerHistoryRef = firestore.collection('users').doc(userID).collection('volunteerHistory');

    // Clear the existing table data
    volunteerHistoryTable.querySelector('tbody').innerHTML = '';

    // Fetch the user's volunteer history
    volunteerHistoryRef.get()
      .then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          var data = doc.data();
          var organization = data.organization;
          var activity = data.activity;
          var hours = data.hours;
          var date = data.date;

          // Create a new row for each volunteer activity and append it to the table
          var newRow = volunteerHistoryTable.querySelector('tbody').insertRow();
          newRow.insertCell(0).textContent = organization;
          newRow.insertCell(1).textContent = activity;
          newRow.insertCell(2).textContent = hours;
          newRow.insertCell(3).textContent = date;
        });
      })
      .catch(function (error) {
        console.error('Error fetching volunteer history:', error);
      });
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


const profileEditForm = document.getElementById('profileEditForm');

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
// Function to add a new volunteer activity to Firestore
function addVolunteerActivityToFirestore(activityData) {
  const user = firebase.auth().currentUser;
  if (user) {
      const userId = user.uid;
      const volunteerHistoryRef = firestore.collection('users').doc(userId).collection('volunteerHistory');

      // Add a new document with a unique ID and the provided activity data
      volunteerHistoryRef.add(activityData)
          .then(() => {
              // Successfully added the activity, you can update the table here
              console.log('Volunteer activity added to Firestore');
          })
          .catch((error) => {
              console.error('Error adding volunteer activity:', error);
          });
  }
}

// Function to open the volunteer activity form popup
function openVolunteerActivityForm() {
  const form = document.getElementById('volunteerActivityForm');
  form.style.display = 'block';
}

// Function to close the volunteer activity form popup
function closeVolunteerActivityForm() {
  const form = document.getElementById('volunteerActivityForm');
  form.style.display = 'none';
}

// Event listener for the "Add Volunteer Activity" button
document.getElementById('addVolunteerActivityButton').addEventListener('click', () => {
  openVolunteerActivityForm();
});

// Event listener for the submit button in the volunteer activity form
document.getElementById('submitVolunteerActivityButton').addEventListener('click', () => {
  const organization = document.getElementById('volunteerOrganization').value;
  const activity = document.getElementById('volunteerActivity').value;
  const hours = document.getElementById('volunteerHours').value;
  const date = document.getElementById('volunteerDate').value;

  // Validate the input fields
  if (!organization || !activity || !hours || !date) {
      alert('Please fill in all fields');
      return;
  }

  const activityData = {
      organization: organization,
      activity: activity,
      hours: parseFloat(hours),
      date: date,
  };

  addVolunteerActivityToFirestore(activityData);
  closeVolunteerActivityForm();
});

// Event listener for the close button in the volunteer activity form
document.getElementById('closeVolunteerActivityForm').addEventListener('click', () => {
  closeVolunteerActivityForm();
});