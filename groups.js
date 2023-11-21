var auth = firebase.auth();
const firestore = firebase.firestore();

// Get the current page's filename
const currentPage = window.location.pathname.split('/').pop();

// Remove the 'active' class from all navigation links
document.querySelectorAll('.nav-link').forEach(link => {
  link.classList.remove('active');
});

// Highlight the active tab based on the current page
document.querySelectorAll('.nav-link').forEach(link => {
  const linkPage = link.getAttribute('href');
  if (linkPage === currentPage) {
    link.classList.add('active');
  }
});

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

// Function to join a group
async function joinGroup(groupName) {
  var username;
  var user = firebase.auth().currentUser;

  if (user) {
    firestore.collection('users').doc(user.uid).get()
      .then(function (doc) {
        if (doc.exists) {
          var userData = doc.data();
          username = userData.username;
          return firestore.collection('groups').doc(groupName).collection('members').doc(user.uid).set({
            userId: user.uid,
            username: username
          });
        } else {
          console.log('User data not found');
          return Promise.reject('User data not found');
        }
      })
      .then(() => {
        // Successfully joined the group
        alert('You have joined the ' + groupName + ' group.');
        // After joining, refresh the list of members
        refreshMembersList(groupName);
      })
      .catch((error) => {
        console.error('Error joining group:', error);
      });
  } else {
    // User is not logged in
    alert('Please log in to join a group.');
  }
}

// Function to refresh the list of members for a group
async function refreshMembersList(groupName) {
  const usernamesList = document.getElementById(groupName + '-members-list');
  usernamesList.innerHTML = ''; // Clear the existing list

  firestore.collection('groups').doc(groupName).collection('members').get().then((membersSnapshot) => {
    membersSnapshot.forEach((memberDoc) => {
      const memberData = memberDoc.data();
      const username = memberData.username;
      const listItem = document.createElement('li');
      listItem.textContent = username;
      usernamesList.appendChild(listItem);
    });
  });
}
async function createGroup(category) {
  var username;
  var user = firebase.auth().currentUser;

  if (user) {
    const newGroupName = prompt('Enter the name of the new group:');
    if (newGroupName) {
      firestore.collection('groups').doc(newGroupName).set({
        title: newGroupName,
        category: category // Set the category for the group
      }).then(() => {
        alert('New group created: ' + newGroupName);
        // After creating the group, refresh the list of groups in the corresponding section
        if (category === 'topic') {
          displayGroupsByCategory('topic', 'topics-list', 'createTopicButton');
        } else if (category === 'event') {
          displayGroupsByCategory('event', 'events-list', 'createEventButton');
        }
      }).catch((error) => {
        console.error('Error creating group:', error);
      });

      firestore.collection('users').doc(user.uid).get().then(function (doc) {
        if (doc.exists) {
          var userData = doc.data();
          username = userData.username;
          return firestore.collection('groups').doc(newGroupName).collection('members').doc(user.uid).set({
            userId: user.uid,
            username: username
          });
        } else {
          console.log('User data not found');
          return Promise.reject('User data not found');
        }
      }).then(() => {
        // Successfully joined the newly created group
        alert('You have joined the ' + newGroupName + ' group.');
      }).catch((error) => {
        console.error('Error joining group:', error);
      });
    }
  } else {
    // User is not logged in
    alert('Please log in to create and join a group.');
  }
}

// Function to fetch and display groups based on category
function displayGroupsByCategory(category, containerId, createButtonId) {
  const groupsList = document.getElementById(containerId);

  // Clear the existing list of groups
  groupsList.innerHTML = '';

  firestore.collection('groups').where('category', '==', category).get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const groupData = doc.data();
      const groupName = groupData.title; // Group name is the document ID

      // Create a group card element
      const groupCard = document.createElement('div');
      groupCard.className = 'group-card';

      const groupNameElement = document.createElement('h3');
      groupNameElement.textContent = groupName;

      const usernamesList = document.createElement('ul');
      const membersTitle = document.createElement('p');
      membersTitle.textContent = 'Members:';

      // Fetch and display usernames for all members in the group
      firestore.collection('groups').doc(groupName).collection('members').get().then((membersSnapshot) => {
        membersSnapshot.forEach((memberDoc) => {
          const memberData = memberDoc.data();
          const username = memberData.username;
          const listItem = document.createElement('li');
          listItem.textContent = username;
          listItem.classList.add('clickable-username');
          usernamesList.appendChild(listItem);
          listItem.addEventListener('click', () => showUserPopup(username));
        });
      });

      const joinButton = document.createElement('button');
      joinButton.textContent = 'Join';
      joinButton.classList.add('join-button');
      joinButton.addEventListener('click', () => joinGroup(groupName));

      groupCard.appendChild(groupNameElement);
      groupCard.appendChild(usernamesList);
      groupCard.appendChild(joinButton);

      groupsList.appendChild(groupCard);
    });
  });

  const createButton = document.getElementById(createButtonId);
  createButton.addEventListener('click', () => createGroup(category));
}

function showUserPopup(username) {
  const userPopup = document.getElementById('user-popup');
  const popupUsername = document.getElementById('popup-username');
  const popupName = document.getElementById('popup-name');
  const popupLocation = document.getElementById('popup-location');
  const popupInterests = document.getElementById('popup-interests');
  const popupEmail = document.getElementById('popup-email');

  // Fetch user data and update the popup content
  firestore.collection('users').where('username', '==', username).get().then((querySnapshot) => {
    if (querySnapshot.empty) {
      // User not found, display appropriate message
      popupUsername.textContent = 'User not found';
      popupName.textContent = '';
      popupLocation.textContent = '';
      popupInterests.textContent = '';
      popupEmail.textContent = '';
    } else {
      // User found, update the popup content
      const userData = querySnapshot.docs[0].data();
      popupUsername.textContent = userData.username;
      popupName.textContent = 'Name: ' + userData.name;
      popupLocation.textContent = 'Location: ' + userData.location;
      popupInterests.textContent = 'Interests: ' + userData.interests.join(', ');
      if (!userData.email) {
        popupEmail.textContent = 'Email: Not available';
      } else {
        popupEmail.textContent = 'Email:'+ userData.email;
      }
      userPopup.style.display = 'block';
    }
  });
}

// Function to close the user popup
function closeUserPopup() {
  const userPopup = document.getElementById('user-popup');
  userPopup.style.display = 'none';
}

// Initialize the groups page
displayGroupsByCategory('topic', 'topics-list', 'createTopicButton');
displayGroupsByCategory('event', 'events-list', 'createEventButton');