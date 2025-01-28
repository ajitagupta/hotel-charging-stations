// Initialize Leaflet Map
function initMap() {
    // Center the map at Zurich
    const zurich = [47.3769, 8.5417]; 
    const map = L.map("map").setView(zurich, 8);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add a marker at Zurich
    L.marker(zurich).addTo(map)
        .bindPopup("<h3>Zurich</h3><p>Plan your journey starting here.</p>")
        .openPopup();
}

// Initialize the map when the page loads
window.onload = initMap;
