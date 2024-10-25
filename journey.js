// Initialize Google Map
function initMap() {
    var zurich = { lat: 47.3769, lng: 8.5417 }; // Center the map at Zurich
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: zurich
    });

    var marker = new google.maps.Marker({
        position: zurich,
        map: map
    });
}
