// Inbox.js
var auth = firebase.auth();
var firestore = firebase.firestore();

// Function to load messages for a specific conversation
function loadMessagesForConversation(conversationId) {
    var messageContainer = document.querySelector('.message-container');
    messageContainer.innerHTML = ''; // Clear the message container
    
    // Reference to the messages collection for the selected conversation
    var messagesRef = firestore.collection('conversations').doc(conversationId).collection('messages');
    
    // Query the messages collection and order by timestamp
    messagesRef.orderBy('timestamp').onSnapshot(function (snapshot) {
        snapshot.forEach(function (doc) {
            var messageData = doc.data();
            // Create message elements and append them to the message container
            var messageElement = document.createElement('div');
            messageElement.textContent = messageData.text;
            messageContainer.appendChild(messageElement);
        });
        
        // Scroll to the bottom of the message container
        messageContainer.scrollTop = messageContainer.scrollHeight;
    });
}

// Function to send a new message
function sendMessage(conversationId, messageText) {
    // Reference to the messages collection for the selected conversation
    var messagesRef = firestore.collection('conversations').doc(conversationId).collection('messages');
    
    // Add a new message document to Firestore
    messagesRef.add({
        text: messageText,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
}

// Event listener for the send button
var sendButton = document.querySelector('#send-button');
sendButton.addEventListener('click', function () {
    var messageInput = document.querySelector('#message-input');
    var messageText = messageInput.value;

    // Check if the message is not empty before sending
    if (messageText.trim() !== '') {
        var selectedConversation = document.querySelector('.conversation.active');
        if (selectedConversation) {
            // Get the conversation ID from the selected conversation
            var conversationId = selectedConversation.getAttribute('data-conversation-id');
            
            // Send the message
            sendMessage(conversationId, messageText);
            
            // Clear the input field
            messageInput.value = '';
        }
    }
});

// Event listener to select a conversation
var conversationList = document.querySelector('.conversations-list');
conversationList.addEventListener('click', function (event) {
    var selectedConversation = event.target;
    if (selectedConversation.classList.contains('conversation')) {
        // Remove the 'active' class from other conversations
        document.querySelectorAll('.conversation').forEach(function (conversation) {
            conversation.classList.remove('active');
        });
        
        // Add the 'active' class to the selected conversation
        selectedConversation.classList.add('active');
        
        // Get the conversation ID from the selected conversation
        var conversationId = selectedConversation.getAttribute('data-conversation-id');
        
        // Load messages for the selected conversation
        loadMessagesForConversation(conversationId);
    }
});

// Function to sign out the user and redirect to the index page
function signOut() {
    firebase.auth().signOut().then(function () {
        // Sign-out successful, redirect to the index page
        window.location.href = 'index.html';
    }).catch(function (error) {
        // An error occurred while signing out
        console.error('Sign-out error:', error);
    });
}

// Event listener for the sign-out button
var signOutButton = document.querySelector('#sign-out-button');
signOutButton.addEventListener('click', function () {
    // Confirm the sign-out action
    var confirmationMessage = signOutButton.getAttribute('data-confirm');
    if (confirm(confirmationMessage)) {
        // User clicked "OK," sign them out
        signOut();
    }
});

const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const conversationsList = document.querySelector('.conversations-list');

searchButton.addEventListener('click', () => {
    const searchUsername = searchInput.value.trim();

    // Query Firestore for a user with the matching username
    firestore.collection('users')
        .where('username', '==', searchUsername)
        .get()
        .then((querySnapshot) => {
            // Clear previous search results
            conversationsList.innerHTML = '';

            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                    const user = doc.data();
                    const userId = doc.id;

                    // Display the search result as an option to start a conversation
                    const resultItem = document.createElement('div');
                    resultItem.classList.add('search-result');
                    resultItem.textContent = user.username;
                    resultItem.addEventListener('click', () => {
                        // Start a new conversation with the selected user
                        startNewConversation(userId, user.username);
                    });

                    conversationsList.appendChild(resultItem);
                });
            } else {
                // Display a message if no matching user was found
                const noResultsMessage = document.createElement('div');
                noResultsMessage.textContent = 'No results found.';
                conversationsList.appendChild(noResultsMessage);
            }
        })
        .catch((error) => {
            console.error('Error searching for a user:', error);
        });
});

function startNewConversation(userId, username) {
    // Create a new conversation document in Firestore
    firestore.collection('conversations').add({
        participants: [auth.currentUser.uid, userId],
        createdAt: new Date(),
    })
    .then((docRef) => {
        // Now, you have a conversation document with a unique ID (docRef.id)
        // You can use this ID to store and retrieve messages for this conversation.

        // You can also update your UI to display the conversation with the selected user.
        // For example, open a chat window or show the conversation in your message container.

        // For this example, we'll just log the conversation ID.
        console.log(`New conversation started with ${username}. Conversation ID: ${docRef.id}`);
    })
    .catch((error) => {
        console.error('Error creating a new conversation:', error);
    });
}