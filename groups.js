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

// Function to fetch and display the list of available groups
// Function to fetch and display the list of available groups
function displayGroups() {
  const groupsList = document.getElementById('groups-list');

  // Query Firestore to get the available groups
  firestore.collection('groups').get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const groupData = doc.data();
      const groupName = groupData.title; // Group name is the document ID

      // Create a group card element and add a join button
      const groupCard = document.createElement('div');
      groupCard.className = 'group-card';

      const groupNameElement = document.createElement('h3');
      groupNameElement.textContent = groupName;

      const usernamesList = document.createElement('ul');
      const membersTitle = document.createElement('p');
      membersTitle.textContent = 'Members:';

      // Fetch and display usernames for all members in the group
      firestore.collection('groups').doc(groupName).collection('members').get().then((membersSnapshot) => {
        usernamesList.appendChild(membersTitle);
        membersSnapshot.forEach((memberDoc) => {
          const memberData = memberDoc.data();
          const username = memberData.username;
          const listItem = document.createElement('li');
          listItem.textContent = username;
          usernamesList.appendChild(listItem);
        });
      });

      const joinButton = document.createElement('button');
      joinButton.id = 'joinGroupButton'
      joinButton.textContent = 'Join';
      joinButton.addEventListener('click', () => joinGroup(groupName));

      groupCard.appendChild(groupNameElement);
      groupCard.appendChild(usernamesList);
      groupCard.appendChild(joinButton);
      groupsList.appendChild(groupCard);
    });
  });
}
displayGroups();

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
// Initialize the groups page by displaying available groups

const createGroupButton = document.getElementById('createGroupButton');
createGroupButton.addEventListener('click', () => {
  var username;
  var user = firebase.auth().currentUser;

  if (user) {
    const newGroupName = prompt('Enter the name of the new group:');
    if (newGroupName) {
      firestore.collection('groups').doc(newGroupName).set({
          title: newGroupName,
      }).then((docRef) => {
          alert('New group created: ' + newGroupName + '. Refresh page to see changes.');
      }).catch((error) => {
          console.error('Error creating group:', error);
      });
  }
    firestore.collection('users').doc(user.uid).get()
      .then(function (doc) {
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
});
