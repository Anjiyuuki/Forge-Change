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
