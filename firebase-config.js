// JavaScript code for handling navigation

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBqQI5B3nOy4tI1GdgVZpcwFsebQhOeVrM",
  authDomain: "forge-change.firebaseapp.com",
  projectId: "forge-change",
  storageBucket: "forge-change.appspot.com",
  messagingSenderId: "325085017096",
  appId: "1:325085017096:web:6cf889cd7e5bd75e088dbd",
  measurementId: "G-9Z8QFCGL1Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());