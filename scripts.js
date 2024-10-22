// Initialize Google Map
function initMap() {
    var zurich = {lat: 47.3769, lng: 8.5417}; // Center the map at Zurich
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: zurich
    });

    var marker = new google.maps.Marker({
        position: zurich,
        map: map
    });
}

// Event listener for form submission
document.getElementById('search-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form from submitting the traditional way
    const location = document.getElementById('location').value;
    searchHotels(location);
});

// Simulate hotel search results with sample placeholder images
function searchHotels(location) {
    const hotelList = document.getElementById('hotel-list');
    hotelList.innerHTML = ''; // Clear any previous results

    // Sample hotel data with image URLs (using placehold.co for placeholders)
    const hotels = [
        { name: 'Hotel Alpha', location: 'Zurich', chargingStations: '2', imageUrl: 'https://placehold.co/300x200?text=Hotel+Alpha' },
        { name: 'Hotel Beta', location: 'Geneva', chargingStations: '5', imageUrl: 'https://placehold.co/300x200?text=Hotel+Beta' },
        { name: 'Hotel Gamma', location: 'Basel', chargingStations: '1', imageUrl: 'https://placehold.co/300x200?text=Hotel+Gamma' },
    ];

    // Filter hotels based on the entered location
    const filteredHotels = hotels.filter(hotel => hotel.location.toLowerCase().includes(location.toLowerCase()));

    // If results are found, display them; otherwise show a 'no results' message
    if (filteredHotels.length > 0) {
        filteredHotels.forEach(hotel => {
            const hotelCard = document.createElement('div');
            hotelCard.className = 'hotel-card';
            hotelCard.innerHTML = `
                <img src="${hotel.imageUrl}" alt="${hotel.name}" class="hotel-image">
                <h3>${hotel.name}</h3>
                <p>Location: ${hotel.location}</p>
                <p>Charging Stations: ${hotel.chargingStations}</p>
            `;
            hotelList.appendChild(hotelCard);
        });
    } else {
        hotelList.innerHTML = '<p>No hotels found in this location.</p>';
    }
}
