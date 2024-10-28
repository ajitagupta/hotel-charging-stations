let map;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 8,
        center: { lat: 46.8182, lng: 8.2275 }
    });

    const cityMarkers = {
        Zurich: { lat: 47.3769, lng: 8.5417 },
        Geneva: { lat: 46.2044, lng: 6.1432 },
        Bern: { lat: 46.9480, lng: 7.4474 },
        Lucerne: { lat: 47.0502, lng: 8.3093 },
        Basel: { lat: 47.5596, lng: 7.5886 }
    };

    for (const city in cityMarkers) {
        const marker = new google.maps.Marker({
            position: cityMarkers[city],
            map: map,
            title: city,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#34b234",
                fillOpacity: 1,
                strokeWeight: 1,
                strokeColor: "#2f8f2f"
            }
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `<h3>${city}</h3><p>Find EV charging stations in ${city}.</p>`
        });

        marker.addListener("click", () => {
            infoWindow.open(map, marker);
        });
    }
}

function loadMap(city) {
    const locations = {
        Zurich: { lat: 47.3769, lng: 8.5417 },
        Geneva: { lat: 46.2044, lng: 6.1432 },
        Bern: { lat: 46.9480, lng: 7.4474 },
        Lucerne: { lat: 47.0502, lng: 8.3093 },
        Basel: { lat: 47.5596, lng: 7.5886 }
    };

    if (locations[city]) {
        map.setCenter(locations[city]);
        map.setZoom(12);
    }
}
