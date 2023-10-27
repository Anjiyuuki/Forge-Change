const apiKey = 'AIzaSyD4KuTAPjAWrncz7ayMNvxhbMMIPQAbMTA';
var organizations = [];

async function initMap() {
  // The location of Uluru
  const position = { lat: 32.7767, lng: -79.9301 };
  // Request needed libraries.
  //@ts-ignore
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  // The map, centered at Uluru
  let map = new Map(document.getElementById("map"), {
    zoom: 12,
    center: position,
    mapId: "DEMO_MAP_ID",
  });
  let infoWindows = [];

  // Fetch organizations from Firestore and populate the map and list
  const db = firebase.firestore();

  async function getOrganizationsFromFirestore() {
    try {
      const querySnapshot = await db.collection('organizations').get();

      organizations = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          name: data.name,
          position: { lat: data.lat, lng: data.lng }, // Assuming you store latitude and longitude in Firestore
          keyword: data.keyword,
          location: data.city,
        };
      });

      // Call the function to display organizations
      displayVolunteerOrganizations(organizations);

      // Create markers and info windows for each organization
      organizations.forEach(org => {
        const orgMarker = new google.maps.Marker({
          position: org.position,
          map: map,
          title: org.name,
        });

        const infoWindow = new google.maps.InfoWindow({
          content: org.name,
        });

        orgMarker.addListener('click', () => {
          infoWindows.forEach(iw => iw.close());
          infoWindow.open(map, orgMarker);
        });

        infoWindows.push(infoWindow);
      });
    } catch (error) {
      console.error('Error getting organizations from Firestore:', error);
    }
  }

  // Call the function to get organizations when the page loads
  getOrganizationsFromFirestore();

  // Function to display filtered volunteer organizations
  function displayVolunteerOrganizations(organizations) {
    const volunteerList = document.querySelector('.volunteer-list');
    volunteerList.innerHTML = '';

    if (organizations.length === 0) {
      volunteerList.innerHTML = '<li>No results found.</li>';
    } else {
      organizations.forEach(org => {
        const listItem = document.createElement('li');
        listItem.style.marginBottom = '10px';
        listItem.style.padding = '10px';
        listItem.style.border = '1px solid #ccc';
        listItem.style.borderRadius = '5px';
        listItem.style.background = '#f4f7e1';
        listItem.style.color = '#333';
        listItem.style.fontSize = '16px';

        listItem.innerHTML = `<strong>Name:</strong> ${org.name}<br><strong>Location:</strong> ${org.location}<br><strong>Topic:</strong> ${org.keyword}`;

        volunteerList.appendChild(listItem);
      });
    }
  }

  function filterVolunteerOrganizations() {
    const locationFilter = document.getElementById('locationFilter').value;
    const keywordFilter = document.getElementById('keywordFilter').value;
  
    const filteredOrganizations = organizations.filter(org => {
      const locationMatch = locationFilter === 'all' || org.location === locationFilter;
      const keywordMatch = keywordFilter === 'all' || org.keyword === keywordFilter;
      
      return locationMatch && keywordMatch;
    });
  
    displayVolunteerOrganizations(filteredOrganizations);
  }
  
  // Add event listeners to filters and keyword input
  document.getElementById('locationFilter').addEventListener('change', filterVolunteerOrganizations);
  document.getElementById('keywordFilter').addEventListener('change', filterVolunteerOrganizations);
  
  // Add event listeners for filter buttons
  document.querySelectorAll('.filter-button').forEach(button => {
    button.addEventListener('click', function () {
      const keyword = this.getAttribute('data-keyword');
      document.getElementById('keywordFilter').value = keyword;
      filterVolunteerOrganizations();
    });
  });
}