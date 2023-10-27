
// Reference to Firebase Authentication
var auth = firebase.auth();
// Reference to Firebase Realtime Database
var database = firebase.database();


document.getElementById('registerButton').addEventListener('click', function() {
    var email = document.getElementById('regEmail').value;
    var password = document.getElementById('regPassword').value;
    var interests = document.getElementById('regInterests').value;
    var location = document.getElementById('regLocation').value;

    // Create a new user with email and password
    auth.createUserWithEmailAndPassword(email, password)
        .then(function(userCredential) {
            // User registered successfully
            var user = userCredential.user;
            document.getElementById('message').textContent = 'Registration successful. User UID: ' + user.uid;
            firebase.auth().onAuthStateChanged(function(user) {
              if (user) {
                  // User is signed in. You can now write data to the database.
                  // Store additional user data (interests and location) in the Realtime Database
                database.ref('users/' + user.uid).set({
                interests: interests,
                location: location
          })
          .then(function() {
            console.log('Data write succeeded');
          })
          .catch(function(error) {
              console.error('Data write failed: ' + error.message);
          });
              } else {
                  // User is not signed in. Handle authentication.
                  console.log("error");
              }
          });
            

            // Redirect to explore.html
            //window.location.href = 'explore.html';
        })
        .catch(function(error) {
            // Handle errors during registration
            var errorCode = error.code;
            var errorMessage = error.message;
            document.getElementById('message').textContent = 'Registration failed: ' + errorMessage;
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
            //window.location.href = 'explore.html';
        })
        .catch(function(error) {
            // Handle errors during login
            var errorCode = error.code;
            var errorMessage = error.message;
            document.getElementById('message').textContent = 'Login failed: ' + errorMessage;
        });
});