// Reference to Firebase Authentication
var auth = firebase.auth();
// Reference to Firebase Firestore
var firestore = firebase.firestore();

document.getElementById('registerButton').addEventListener('click', function() {
    var email = document.getElementById('regEmail').value;
    var password = document.getElementById('regPassword').value;
    var username = document.getElementById('regUsername').value; // Get the username input value
    var name = document.getElementById('regName').value;
    var location = document.getElementById('regLocation').value;
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
                            window.location.href = 'explore.html';
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
            //window.location.href = 'explore.html';
        })
        .catch(function(error) {
            // Handle errors during login
            var errorCode = error.code;
            var errorMessage = error.message;
            document.getElementById('message').textContent = 'Login failed: ' + errorMessage;
        });
});