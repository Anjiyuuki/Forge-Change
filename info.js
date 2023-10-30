var firestore = firebase.firestore();
var auth = firebase.auth();


// Get the user's ID (you may need to modify this part to get the user's ID)
var userId = "YOUR_USER_ID"; // Replace with the actual user's ID

document.getElementById('addHoursButton').addEventListener('click', function() {
    // Add 10 hours to the user's volunteer hours
    firestore.collection('users').doc(userId).get()
        .then(function(doc) {
            if (doc.exists) {
                var userData = doc.data();
                var currentHours = userData.hours || 0;
                var newHours = currentHours + 10;

                // Update the user's volunteer hours in the Firestore database
                firestore.collection('users').doc(userId).update({
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

function addVolunteerHours(hoursToAdd) {
    const volunteerHoursElement = document.getElementById('volunteer-hours');
    const currentHours = parseInt(volunteerHoursElement.textContent, 10);
    const newHours = currentHours + hoursToAdd;
    volunteerHoursElement.textContent = newHours;
    // Update the user's volunteer hours in your data storage.
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