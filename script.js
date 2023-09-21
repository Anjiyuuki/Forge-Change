// JavaScript code for handling navigation

document.getElementById('explore').addEventListener('click', function () {
  // Handle the "Explore" click event
  alert('Explore clicked'); // Replace with your logic
});

document.getElementById('groups').addEventListener('click', function () {
  // Handle the "Groups" click event
  alert('Groups clicked'); // Replace with your logic
});

document.getElementById('inbox').addEventListener('click', function () {
  // Handle the "Inbox" click event
  alert('Inbox clicked'); // Replace with your logic
});

document.getElementById('info').addEventListener('click', function () {
  // Handle the "Info" click event
  alert('Info clicked'); // Replace with your logic
});

const volunteerOrganizations = [
  { name: 'Organization A', location: 'City 1', topic: 'Education' },
  { name: 'Organization B', location: 'City 2', topic: 'Environment' },
  { name: 'Organization C', location: 'City 1', topic: 'Education' },
  // Add more organizations with properties (name, location, topic)
];

// Function to filter volunteer organizations based on location and topic
function filterVolunteerOrganizations() {
  const locationFilter = document.getElementById('locationFilter').value;
  const topicFilter = document.getElementById('topicFilter').value;
  const filteredOrganizations = volunteerOrganizations.filter(org => {
      return (locationFilter === 'all' || org.location === locationFilter) &&
             (topicFilter === 'all' || org.topic === topicFilter);
  });

  displayVolunteerOrganizations(filteredOrganizations);
}

// Function to display filtered volunteer organizations
function displayVolunteerOrganizations(organizations) {
  const volunteerList = document.querySelector('.volunteer-list');
  volunteerList.innerHTML = '';

  if (organizations.length === 0) {
      volunteerList.innerHTML = '<li>No results found.</li>';
  } else {
      organizations.forEach(org => {
          const listItem = document.createElement('li');
          listItem.textContent = `Name: ${org.name}, Location: ${org.location}, Topic: ${org.topic}`;
          volunteerList.appendChild(listItem);
      });
  }
}

// Function to perform a search (you can customize this based on your search logic)
function searchVolunteerOpportunities() {
  const searchInput = document.getElementById('searchInput').value;
  const searchResults = volunteerOrganizations.filter(org =>
      org.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  displayVolunteerOrganizations(searchResults);
}

// Initial display of all volunteer organizations
displayVolunteerOrganizations(volunteerOrganizations);

// Attach event listeners to filters
document.getElementById('locationFilter').addEventListener('change', filterVolunteerOrganizations);
document.getElementById('topicFilter').addEventListener('change', filterVolunteerOrganizations);
