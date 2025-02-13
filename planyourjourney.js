document.addEventListener("DOMContentLoaded", function () {
    let map = L.map('map').setView([46.8182, 8.2275], 7);
    let routeLayer = null;
    let startMarker = null;
    let endMarker = null;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    function fetchChargingStations() {
        let source = document.getElementById("source").value.trim();
        let destination = document.getElementById("destination").value.trim();
        let maxDistance = document.getElementById("max-distance").value;
        let chargeDifference = document.getElementById("charge_difference").value;

        if (!source || !destination || !maxDistance || !chargeDifference) {
            alert("Please enter valid values for all fields.");
            return;
        }

        Promise.all([
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${source}`).then(res => res.json()),
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${destination}`).then(res => res.json())
        ]).then(results => {
            let sourceData = results[0][0];
            let destData = results[1][0];

            if (!sourceData || !destData) {
                alert("Invalid locations. Please try again.");
                return;
            }

            let sourceLat = parseFloat(sourceData.lat);
            let sourceLon = parseFloat(sourceData.lon);
            let destLat = parseFloat(destData.lat);
            let destLon = parseFloat(destData.lon);

            let backendUrl = `https://electristay.vercel.app/proxy-api?source_lon=${sourceLon}&source_lat=${sourceLat}&dest_lon=${destLon}&dest_lat=${destLat}&maxDistance=${maxDistance}`;
            /*let backendUrl = `http://127.0.0.1:5000/proxy-api?source_lon=${sourceLon}&source_lat=${sourceLat}&dest_lon=${destLon}&dest_lat=${destLat}&maxDistance=${maxDistance}`;*/
            console.log("📌 Sending Request to Backend:", backendUrl);

            fetch(backendUrl)
                .then(response => response.json())
                .then(data => {
                    console.log("🔍 Backend Response:", data);

                    if (!data.route || !data.stations || data.stations.length === 0) {
                        alert("No charging stations found along this route.");
                        return;
                    }

                    map.eachLayer(layer => {
                        if (layer instanceof L.Marker || layer === routeLayer) {
                            map.removeLayer(layer);
                        }
                    });

                    let startIcon = L.icon({
                        iconUrl: './icons/start.png',
                        iconSize: [70, 70]
                    });

                    let endIcon = L.icon({
                        iconUrl: './icons/end.png',
                        iconSize: [70, 70]
                    });

                    startMarker = L.marker([sourceLat, sourceLon], { icon: startIcon })
                        .addTo(map)
                        .bindPopup(`<b>Start Location</b><br>${source}`);

                    endMarker = L.marker([destLat, destLon], { icon: endIcon })
                        .addTo(map)
                        .bindPopup(`<b>Destination</b><br>${destination}`);

                    let routeCoordinates = data.route.map(coord => [coord[0], coord[1]]);
                    routeLayer = L.polyline(routeCoordinates, { color: 'blue', weight: 4 }).addTo(map);

                    data.stations.forEach(station => {
                        let lat = station.latitude;
                        let lon = station.longitude;
                        let distance = station.distance_km.toFixed(2); // Distance to route in km

                        let costApiUrl = `https://electristay.vercel.app/estimate-charging-cost?charge_difference=${chargeDifference}&latitude=${lat}&longitude=${lon}`;
                        /*let costApiUrl = `http://127.0.0.1:5001/estimate-charging-cost?charge_difference=${chargeDifference}&latitude=${lat}&longitude=${lon}`;*/
                        console.log("⚡ Fetching Cost from:", costApiUrl);

                        fetch(costApiUrl)
                            .then(res => res.json())
                            .then(costData => {
                                let popupContent = `
                                    <b>Charging Station:</b> ${costData.charging_station || "Unknown"}<br>
                                    <b>Operator:</b> ${costData.operator || "N/A"}<br>
                                    <b>Latitude:</b> ${lat}<br>
                                    <b>Longitude:</b> ${lon}<br>
                                    <b>Distance to Route:</b> ${distance} km<br>
                                    <b>Energy Needed:</b> ${costData.energy_needed_kwh} kWh<br>
                                    <b>Price per kWh:</b> €${costData.price_per_kwh}<br>
                                    <b>Estimated Cost:</b> <strong>€${costData.estimated_cost}</strong>
                                `;

                                let iconUrl = station.has_restaurant ? './icons/restaurant.png' : './icons/charging.png';

                                L.marker([lat, lon], {
                                    icon: L.icon({ iconUrl: iconUrl, iconSize: [30, 30] })
                                })
                                .addTo(map)
                                .bindPopup(popupContent);
                            })
                            .catch(error => console.error("⚠️ Error Fetching Cost:", error));
                    });

                    map.fitBounds(routeLayer.getBounds());
                })
                .catch(error => console.error("⚠️ Error:", error));
        }).catch(error => console.error("⚠️ Location Fetch Error:", error));
    }

    window.fetchChargingStations = fetchChargingStations;
});


function toggleConfiguration() {
        let configSection = document.getElementById("configuration-section");
        if (configSection.style.display === "none" || configSection.style.display === "") {
            configSection.style.display = "block";
        } else {
            configSection.style.display = "none";
        }
    }
