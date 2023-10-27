
var firestore = firebase.firestore();
var auth = firebase.auth();

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
