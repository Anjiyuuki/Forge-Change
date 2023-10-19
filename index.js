// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyBqQI5B3nOy4tI1GdgVZpcwFsebQhOeVrM",
  authDomain: "forge-change.firebaseapp.com",
  databaseURL: "https://forge-change-default-rtdb.firebaseio.com",
  projectId: "forge-change",
  storageBucket: "forge-change.appspot.com",
  messagingSenderId: "325085017096",
  appId: "1:325085017096:web:6cf889cd7e5bd75e088dbd",
  measurementId: "G-9Z8QFCGL1Q"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const database = firebase.database()

// Reference to Firebase Authentication
var auth = firebase.auth();

document.getElementById('registerButton').addEventListener('click', function() {
    var email = document.getElementById('regEmail').value;
    var password = document.getElementById('regPassword').value;

    // Create a new user with email and password
    auth.createUserWithEmailAndPassword(email, password)
        .then(function(userCredential) {
            // User registered successfully
            var user = userCredential.user;
            document.getElementById('message').textContent = 'Registration successful. User UID: ' + user.uid;

            // Redirect to explore.html
            window.location.href = 'explore.html';
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
            window.location.href = 'explore.html';
        })
        .catch(function(error) {
            // Handle errors during login
            var errorCode = error.code;
            var errorMessage = error.message;
            document.getElementById('message').textContent = 'Login failed: ' + errorMessage;
        });
});