// Initialize and add the map
let map;
let infoWindows = [];

async function initMap() {
  // The location of Uluru
  const position = { lat: 32.7767, lng: -79.9301 };
  // Request needed libraries.
  //@ts-ignore
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  // The map, centered at Uluru
  map = new Map(document.getElementById("map"), {
    zoom: 12,
    center: position,
    mapId: "DEMO_MAP_ID",
  });

  // The marker, positioned at Uluru
  const marker = new AdvancedMarkerElement({
    map: map,
    position: position,
    title: "Uluru",
  });

  // Define marker positions and titles for volunteer organizations
  const organizations = [
    { name: 'Charleston Animal Society', position: { lat: 32.89785755181348, lng: -80.02613912525885 }, topic: 'Animals' },
    { name: 'Charleston Water Keeper', position: { lat: 32.79306978656025, lng: -79.87765656826706 }, topic: 'Environment' },
    { name: 'We Are Family', position: { lat: 32.85935223162799, lng: -79.96841791859042 }, topic: 'Family' },
    { name: 'Pet Helpers', position: { lat: 32.713065323335094, lng: -79.96543213967637}, topic: 'Animals' },
    { name: 'Charleston Pride', position: { lat: 32.85946977616801, lng: -79.96849757791162}, topic: 'LGBTQ+' },
    { name: 'Charleston County School District', position: { lat: 32.78805602208032, lng: -79.93073096441769}, topic: 'Education' },
    { name: 'Lowcountry Food Bank', position: { lat: 32.84422186379979, lng: -79.97256140329912}, topic: 'Humanitarian' },
    { name: 'Crisis Ministries', position: { lat: 32.80078260181505, lng: -79.94385945767195}, topic: 'Humanitarian' },
    { name: 'One80 Place', position: { lat: 32.80023989056299, lng:-79.9440445761139}, topic: 'Humanitarian' },
    { name: 'Kids on Point', position: { lat: 32.78558916605061, lng: -79.93418023454993}, topic: 'Education' },
    { name: 'Lowcountry Land Trust', position: { lat: 32.79968352177207, lng: -79.95212044988715}, topic: 'Environment' },
    { name: 'The Sustainability Institute', position: { lat: 32.86499250406155, lng: -79.98893208466896}, topic: 'Environment' },
    { name: 'LEARN Horse Rescue ', position: { lat: 32.75064733670091, lng: -80.26527458996944}, topic: 'Animals' },
    
    
 ];

  // Create markers and info windows for each organization
  organizations.forEach(org => {
    const orgMarker = new google.maps.Marker({
      position: org.position,
      map: map,
      title: org.name,
    });

    // Create an InfoWindow for this marker
    const infoWindow = new google.maps.InfoWindow({
      content: org.name, // Display the organization name
    });

    // Attach a click event to open the InfoWindow when the marker is clicked
    orgMarker.addListener('click', () => {
      // Close any open info windows before opening a new one
      infoWindows.forEach(iw => iw.close());
      infoWindow.open(map, orgMarker);
    });

    // Store the InfoWindow in the array
    infoWindows.push(infoWindow);
  });
}

initMap();

const volunteerOrganizations = [
  { name: 'Charleston Animal Society', location: 'Charleston', topic: 'Animals' },
  { name: 'Charleston Water Keeper', location: 'Charleston', topic: 'Environment' },
  { name: 'We Are Family', location: 'Charleston', topic: 'LGBTQ+' },
  { name: 'Pet Helpers', location: 'Charleston', topic: 'Animals' },
  { name: 'Charleston Pride', location: 'Charleston', topic: 'LGBTQ+' },
  { name: 'Charleston County School District', location: 'Charleston', topic: 'Education' },
  { name: 'Lowcountry Food Bank', location: 'Charleston', topic: 'Humanitarian' },
  { name: 'Crisis Ministries', location: 'Charleston', topic: 'Humanitarian' },
  { name: 'One80 Place', location: 'Charleston', topic: 'Humanitarian' },
  { name: 'Kids on Point', location: 'Charleston', topic: 'Education' },
  { name: 'Lowcountry Land Trust', location: 'Charleston', topic: 'Environment' },
  { name: 'The Sustainability Institute', location: 'Charleston', topic: 'Environment' },
  { name: 'LEARN Horse Rescue', location: 'Charleston', topic: 'Animals' },


  // Add more organizations with properties (name, location, topic)
];

// Function to filter volunteer organizations based on location and topic
function filterVolunteerOrganizations() {
  const locationFilter = document.getElementById('locationFilter').value;
  const topicFilter = document.getElementById('topicFilter').value;
  const keyword = document.getElementById('keywordInput').value.toLowerCase(); // Convert keyword to lowercase

  const filteredOrganizations = volunteerOrganizations.filter(org => {
    const locationMatch = locationFilter === 'all' || org.location === locationFilter;
    const topicMatch = topicFilter === 'all' || org.topic === topicFilter;
    const orgNameLowerCase = org.name.toLowerCase(); // Convert organization name to lowercase for case-insensitive comparison
    const keywordMatch = orgNameLowerCase.includes(keyword);

    return locationMatch && topicMatch && keywordMatch;
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



// Attach event listeners to filters and keyword input
document.getElementById('locationFilter').addEventListener('change', filterVolunteerOrganizations);
document.getElementById('topicFilter').addEventListener('change', filterVolunteerOrganizations);
document.getElementById('keywordInput').addEventListener('input', filterVolunteerOrganizations);

// Add event listeners to filter buttons
document.getElementById('filterAnimals').addEventListener('click', function () {
  // When the "Animals" button is clicked, filter by topic "Animals"
  document.getElementById('topicFilter').value = 'Animals';
  filterVolunteerOrganizations();
});

document.getElementById('filterEnvironment').addEventListener('click', function () {
  // When the "Environment" button is clicked, filter by topic "Environment"
  document.getElementById('topicFilter').value = 'Environment';
  filterVolunteerOrganizations();
});
document.getElementById('filterLGBTQ').addEventListener('click', function () {
  // When the "All" button is clicked, reset the topic filter to "All" and trigger filtering
  document.getElementById('topicFilter').value = 'LGBTQ+';
  filterVolunteerOrganizations();
});
document.getElementById('filterEducation').addEventListener('click', function () {
  // When the "All" button is clicked, reset the topic filter to "All" and trigger filtering
  document.getElementById('topicFilter').value = 'Education';
  filterVolunteerOrganizations();
});
document.getElementById('filterHumanitarian').addEventListener('click', function () {
  // When the "All" button is clicked, reset the topic filter to "All" and trigger filtering
  document.getElementById('topicFilter').value = 'Humanitarian';
  filterVolunteerOrganizations();
});

document.getElementById('filterAll').addEventListener('click', function () {
  // When the "All" button is clicked, reset the topic filter to "All" and trigger filtering
  document.getElementById('topicFilter').value = 'all';
  filterVolunteerOrganizations();
});
function displayVolunteerOrganizations(organizations) {
  const volunteerList = document.querySelector('.volunteer-list');
  volunteerList.innerHTML = '';

  if (organizations.length === 0) {
    volunteerList.innerHTML = '<li>No results found.</li>';
  } else {
    organizations.forEach(org => {
      const listItem = document.createElement('li');
      listItem.style.marginBottom = '10px'; // Add some margin between each result
      listItem.style.padding = '10px'; // Add some padding to make it visually appealing
      listItem.style.border = '1px solid #ccc'; // Add a border for separation
      listItem.style.borderRadius = '5px'; // Round the corners
      listItem.style.background = '#f4f7e1'; // Light background color
      listItem.style.color = '#333'; // Text color
      listItem.style.fontSize = '16px'; // Font size

      // Create a visually appealing display format
      listItem.innerHTML = `<strong>Name:</strong> ${org.name}<br><strong>Location:</strong> ${org.location}<br><strong>Topic:</strong> ${org.topic}`;
      
      volunteerList.appendChild(listItem);
    });
  }
}
