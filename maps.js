let map;

// Initialize the map using Leaflet
function initMap() {
    // Set initial map view to Switzerland with default zoom
    map = L.map("map").setView([46.8182, 8.2275], 8);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Define city coordinates
    const cityMarkers = {
        Zurich: { lat: 47.3769, lng: 8.5417 },
        Geneva: { lat: 46.2044, lng: 6.1432 },
        Bern: { lat: 46.9480, lng: 7.4474 },
        Lucerne: { lat: 47.0502, lng: 8.3093 },
        Basel: { lat: 47.5596, lng: 7.5886 }
    };

    // Add markers for each city
    for (const city in cityMarkers) {
        const marker = L.marker([cityMarkers[city].lat, cityMarkers[city].lng]).addTo(map);

        // Add popup with information about the city
        marker.bindPopup(`<h3>${city}</h3><p>Find EV charging stations in ${city}.</p>`);

        // Optional: Open popup on marker hover
        marker.on("mouseover", function () {
            this.openPopup();
        });

        // Optional: Close popup when hover ends
        marker.on("mouseout", function () {
            this.closePopup();
        });
    }
}

// Load the map and center it on the selected city
function loadMap(city) {
    const locations = {
        Zurich: { lat: 47.3769, lng: 8.5417 },
        Geneva: { lat: 46.2044, lng: 6.1432 },
        Bern: { lat: 46.9480, lng: 7.4474 },
        Lucerne: { lat: 47.0502, lng: 8.3093 },
        Basel: { lat: 47.5596, lng: 7.5886 }
    };

    if (locations[city]) {
        // Set map view to the selected city with a closer zoom
        map.setView([locations[city].lat, locations[city].lng], 12);
    }
}

// Initialize the map when the page loads
window.onload = initMap;
