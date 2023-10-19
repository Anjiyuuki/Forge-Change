// Initialize Firebase with your configuration
firebase.initializeApp(firebaseConfig);

const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("error-message");

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    // Sign in with email and password
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // User signed in, redirect to explore.html
            window.location.href = "explore.html";
        })
        .catch((error) => {
            // Handle errors, and display error message
            errorMessage.textContent = error.message;
        });
});


// Reference the registration form and error message
const registerForm = document.getElementById("register-form");
const registerEmailInput = document.getElementById("register-email");
const registerPasswordInput = document.getElementById("register-password");
const registerErrorMessage = document.getElementById("register-error-message");

registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = registerEmailInput.value;
    const password = registerPasswordInput.value;

    // Register a new user with email and password
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Registration successful
            const user = userCredential.user;

            // Add user data to Firestore
            const db = firebase.firestore();
            db.collection("users").doc(user.uid).set({
                email: user.email,
                // Add additional user data here if needed
            })
            .then(() => {
                // User data added to Firestore, you can redirect the user to the login page
                window.location.href = "login.html";
            })
            .catch((error) => {
                // Handle Firestore data addition errors and display error message
                registerErrorMessage.textContent = error.message;
            });
        })
        .catch((error) => {
            // Handle registration errors and display error message
            registerErrorMessage.textContent = error.message;
        });
});

