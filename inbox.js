// Reference to Firebase Authentication
var auth = firebase.auth();
// Reference to Firebase Firestore
var firestore = firebase.firestore();

var currentUser; // Store the current user's data
var selectedRecipient; // Store the selected recipient's data

// Check if the user is logged in
auth.onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in, retrieve user's name
      firestore.collection('users').doc(user.uid).get()
      .then(function(doc) {
          if (doc.exists) {
            var userData = doc.data();
            document.getElementById('user-display-name').textContent = "Logged in as: " + userData.name;
            currentUser = user;

            // Populate the conversation list
            populateConversationList(user);

          } else {
              console.log('User data not found');
          }
      })
      .catch(function(error) {
          console.log('Error getting user data:', error);
      });
    } else {
        // User is signed out
        window.location.href = 'index.html'; // Redirect to the index page
    }
});

function populateConversationList(user) {
    // Retrieve the list of users from the Firestore database
    firestore.collection('users').get().then(function(querySnapshot) {
        var recipientList = document.getElementById('recipient-list');
        recipientList.innerHTML = ''; // Clear existing options

        querySnapshot.forEach(function(doc) {
            var userData = doc.data();

            // Exclude the current user from the recipient list
            if (doc.id !== user.uid) {
                var option = document.createElement('option');
                option.value = doc.id; // Use the user's ID as the option value
                option.textContent = userData.name; // Display the user's name
                recipientList.appendChild(option);
            }
        });
    });
}

function selectRecipient() {
    var recipientId = document.getElementById('recipient-list').value;
    selectedRecipient = recipientId;

    // Show the message input and the message thread
    document.getElementById('message-input').style.display = 'block';
    document.getElementById('messages-popup').style.display = 'block';

    // Populate the message thread
    populateMessageThread(currentUser.uid, recipientId);
}

function populateMessageThread(senderId, recipientId) {
    // Query the messages between the sender and recipient
    firestore.collection('messages')
        .where('participants', 'array-contains', senderId)
        .where('participants', 'array-contains', recipientId)
        .orderBy('timestamp', 'asc')
        .get()
        .then(function(querySnapshot) {
            var messageThread = document.getElementById('message-thread');
            messageThread.innerHTML = ''; // Clear existing messages

            querySnapshot.forEach(function(doc) {
                var messageData = doc.data();
                var message = document.createElement('div');
                message.textContent = messageData.text;
                messageThread.appendChild(message);
            });
        });
}

function sendMessage() {
    var messageInput = document.getElementById('message-input');
    var messageText = messageInput.value;
    messageInput.value = ''; // Clear the input field

    if (messageText.trim() === '') {
        return; // Don't send empty messages
    }

    // Create a new message document in Firestore
    firestore.collection('messages').add({
        participants: [currentUser.uid, selectedRecipient],
        text: messageText,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
}

document.getElementById('recipient-list').addEventListener('change', selectRecipient);
document.getElementById('send-button').addEventListener('click', sendMessage);
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