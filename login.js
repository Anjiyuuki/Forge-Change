// Initialize Firebase with your Firebase config
firebase.initializeApp(firebaseConfig);

const loginForm = document.getElementById("login-form");
const errorMessage = document.getElementById("error-message");

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = loginForm.email.value;
    const password = loginForm.password.value;

    // Sign in with Firebase Authentication
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Successful login
            const user = userCredential.user;
            console.log("Logged in as:", user.email);
        })
        .catch((error) => {
            // Handle login errors
            errorMessage.textContent = error.message;
        });
});
