// Reference to Firebase Authentication
var auth = firebase.auth();
// Reference to Firebase Firestore
var firestore = firebase.firestore();

document.getElementById('registerButton').addEventListener('click', function() {
  var email = document.getElementById('regEmail').value;
  var password = document.getElementById('regPassword').value;
  var username = document.getElementById('regUsername').value;
  var name = document.getElementById('regName').value;
  var confirmPassword = document.getElementById('regConfirmPassword').value; // Get the confirm password
  // Check if the password and confirm password match
  if (password !== confirmPassword) {
    document.getElementById('message').textContent = 'Password and confirm password do not match.';
    return; // Prevent registration if passwords don't match
}
  
  // Get the selected location from the dropdown
  var locationDropdown = document.getElementById('regLocation');
  var location = locationDropdown.options[locationDropdown.selectedIndex].value;
  
  var interests = Array.from(document.querySelectorAll('input[name="interest"]:checked')).map(checkbox => checkbox.value);
  // Check if the username already exists in Firestore
    firestore.collection('users')
        .where('username', '==', username)
        .get()
        .then(function(querySnapshot) {
            if (!querySnapshot.empty) {
                // Username already exists, show an error message
                document.getElementById('message').textContent = 'Username is already taken. Please choose a different one.';
            } else {
                // Username is unique, proceed with user registration
                auth.createUserWithEmailAndPassword(email, password)
                    .then(function(userCredential) {
                        // User registered successfully
                        var user = userCredential.user;

                        // Store user information in Firestore
                        firestore.collection('users').doc(user.uid).set({
                            username: username,
                            name: name,
                            location: location,
                            interests: interests,
                            hours: 0
                        })
                        .then(function() {
                            document.getElementById('message').textContent = 'Registration successful. User UID: ' + user.uid;
                            // Redirect to explore.html or any other page
                            window.location.href = 'organizations.html';
                        })
                        .catch(function(error) {
                            console.error('Error adding user information to Firestore: ', error);
                        });
                    })
                    .catch(function(error) {
                        // Handle errors during registration
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        document.getElementById('message').textContent = 'Registration failed: ' + errorMessage;
                    });
            }
        })
        .catch(function(error) {
            console.error('Error checking username availability: ', error);
        });
});


document.getElementById('loginButton').addEventListener('click', function() {
    var email = document.getElementById('loginEmail').value;
    var password = document.getElementById('loginPassword').value;

    // Sign in with email and password
    auth.signInWithEmailAndPassword(email, password)
        .then(function(userCredential) {
            // User logged in successfully
            var user = userCredential.user;
            document.getElementById('message').textContent = 'Login successful. User UID: ' + user.uid;

            // Redirect to explore.html
            window.location.href = 'organizations.html';
        })
        .catch(function(error) {
            // Handle errors during login
            var errorCode = error.code;
            var errorMessage = error.message;
            document.getElementById('message').textContent = 'Login failed: ' + errorMessage;
        });
});


  // Add event listener for the reset password button
document.getElementById('resetPasswordButton').addEventListener('click', function() {
  var resetEmail = document.getElementById('resetEmail').value;

  // Send a password reset email
  auth.sendPasswordResetEmail(resetEmail)
      .then(function() {
          document.getElementById('message').textContent = 'Password reset email sent. Check your email.';
      })
      .catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          document.getElementById('message').textContent = 'Password reset failed: ' + errorMessage;
      });
});


function checkPasswordStrength() {
  var password = document.getElementById('regPassword').value;

  // Check password against requirements
  var lengthRequirement = password.length >= 8;
  var uppercaseRequirement = /[A-Z]/.test(password);
  var lowercaseRequirement = /[a-z]/.test(password);
  var numberRequirement = /\d/.test(password);

  // Update requirements display
  document.getElementById('lengthRequirement').style.color = lengthRequirement ? 'green' : 'red';
  document.getElementById('uppercaseRequirement').style.color = uppercaseRequirement ? 'green' : 'red';
  document.getElementById('lowercaseRequirement').style.color = lowercaseRequirement ? 'green' : 'red';
  document.getElementById('numberRequirement').style.color = numberRequirement ? 'green' : 'red';

  // Calculate overall strength
  var strength = 0;
  if (lengthRequirement) strength += 25;
  if (uppercaseRequirement) strength += 25;
  if (lowercaseRequirement) strength += 25;
  if (numberRequirement) strength += 25;

  // Update strength display
  document.getElementById('strengthValue').textContent = strength + '%';
  document.getElementById('strengthValue').style.color = strength === 100 ? 'green' : 'red';
}