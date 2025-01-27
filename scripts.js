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

// Updated sample hotel data with slugs
const hotels = [
    { name: 'Hotel Alpha', location: 'Zurich', chargingStations: 2, imageUrl: 'https://placehold.co/300x200?text=Hotel+Alpha', slug: 'hotel-alpha' },
    { name: 'Hotel Beta', location: 'Geneva', chargingStations: 5, imageUrl: 'https://placehold.co/300x200?text=Hotel+Beta', slug: 'hotel-beta' },
    { name: 'Hotel Gamma', location: 'Basel', chargingStations: 1, imageUrl: 'https://placehold.co/300x200?text=Hotel+Gamma', slug: 'hotel-gamma' },
];

// Function to display filtered hotels dynamically
function searchHotels(location) {
    const hotelList = document.getElementById('hotel-list');
    hotelList.innerHTML = ''; // Clear previous results

    // Convert the location to lowercase and trim extra spaces
    const searchTerm = location.toLowerCase().trim();

    // Filter hotels based on the entered location
    const filteredHotels = hotels.filter(hotel => hotel.location.toLowerCase().includes(searchTerm));

    // If results are found, display them; otherwise show a 'no results' message
    if (filteredHotels.length > 0) {
        filteredHotels.forEach(hotel => {
            const hotelCard = document.createElement('div');
            hotelCard.className = 'hotel-card';
            hotelCard.innerHTML = `
                <img src="${hotel.imageUrl}" alt="${hotel.name}" class="hotel-image">
                <div class="hotel-info">
                    <h3><a href="hoteldescription.html?hotel=${hotel.slug}">${hotel.name}</a></h3>
                    <p>Location: ${hotel.location}</p>
                    <p>Charging Stations: ${hotel.chargingStations}</p>
                </div>
            `;
            hotelList.appendChild(hotelCard);
        });
    } else {
        hotelList.innerHTML = '<p>No hotels found in this location.</p>';
    }
}

// Event listener for form submission
document.getElementById('search-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form from submitting the traditional way
    const location = document.getElementById('location').value;

    // Check if the user entered a location
    if (location) {
        searchHotels(location);
    } else {
        // If no location is entered, show all hotels
        searchHotels('');
    }
});

// Translation dictionary with dropdown options added
const translations = {
    en: {
        home: "Home",
        hotels: "Hotels",
        map: "Map",
        journey: "Plan Your Journey",
        about: "About Us",
        contact: "Contact",
        searchTitle: "Find Hotels with EV Charging",
        search: "Search",
        location: "Enter location",
        chargingTypeAll: "Select Charging Type",
        chargingTypeAny: "Any",
        chargingTypeRapid: "Rapid / Ultra-Rapid (CCS, CHAdeMO)",
        chargingTypeFast: "Fast Charging (Type 2, 7kW-22kW)",
        chargingTypeSlow: "Slow Charging (Type 1, up to 3.7kW)",
        footerRights: "All rights reserved."
    },
    de: {
        home: "Startseite",
        hotels: "Hotels",
        map: "Karte",
        journey: "Reise planen",
        about: "Über uns",
        contact: "Kontakt",
        searchTitle: "Finden Sie Hotels mit EV-Ladestationen",
        search: "Suche",
        location: "Ort eingeben",
        chargingTypeAll: "Ladeart wählen",
        chargingTypeAny: "Alle",
        chargingTypeRapid: "Schnell / Ultraschnell (CCS, CHAdeMO)",
        chargingTypeFast: "Schnellladung (Typ 2, 7kW-22kW)",
        chargingTypeSlow: "Langsame Ladung (Typ 1, bis zu 3.7kW)",
        footerRights: "Alle Rechte vorbehalten."
    },
    fr: {
        home: "Accueil",
        hotels: "Hôtels",
        map: "Carte",
        journey: "Planifiez votre voyage",
        about: "À propos de nous",
        contact: "Contact",
        searchTitle: "Trouvez des hôtels avec des stations de recharge EV",
        search: "Chercher",
        location: "Entrez l'emplacement",
        chargingTypeAll: "Sélectionnez le type de recharge",
        chargingTypeAny: "Tous",
        chargingTypeRapid: "Rapide / Ultra-Rapide (CCS, CHAdeMO)",
        chargingTypeFast: "Recharge rapide (Type 2, 7kW-22kW)",
        chargingTypeSlow: "Recharge lente (Type 1, jusqu'à 3.7kW)",
        footerRights: "Tous droits réservés."
    },
    it: {
        home: "Home",
        hotels: "Hotel",
        map: "Mappa",
        journey: "Pianifica il tuo viaggio",
        about: "Chi siamo",
        contact: "Contatti",
        searchTitle: "Trova hotel con stazioni di ricarica per EV",
        search: "Cerca",
        location: "Inserisci la località",
        chargingTypeAll: "Seleziona il tipo di ricarica",
        chargingTypeAny: "Qualsiasi",
        chargingTypeRapid: "Rapida / Ultra-rapida (CCS, CHAdeMO)",
        chargingTypeFast: "Ricarica veloce (Tipo 2, 7kW-22kW)",
        chargingTypeSlow: "Ricarica lenta (Tipo 1, fino a 3.7kW)",
        footerRights: "Tutti i diritti riservati."
    },
    rm: {
        home: "Chasa",
        hotels: "Hotels",
        map: "Charta",
        journey: "Planischar tia via",
        about: "Da nus",
        contact: "Contact",
        searchTitle: "Chatta hotels cun staziuns da chargiar EV",
        search: "Tschertga",
        location: "Endatescha il lieu",
        chargingTypeAll: "Tscherna il tip da chargiar",
        chargingTypeAny: "Tut",
        chargingTypeRapid: "Svelt / Ultra-svelt (CCS, CHAdeMO)",
        chargingTypeFast: "Chargiada svelta (Tip 2, 7kW-22kW)",
        chargingTypeSlow: "Chargiada plauna (Tip 1, fin 3.7kW)",
        footerRights: "Tuts dretgs riservads."
    }
};

// Set up event listener for language change
document.getElementById("language-selector").addEventListener("change", (event) => {
    const selectedLanguage = event.target.value;
    updateContentLanguage(selectedLanguage);
});


// Update function to include dropdown translations
function updateContentLanguage(lang) {
    document.querySelectorAll("[data-translate]").forEach((element) => {
        const key = element.getAttribute("data-translate");
        if (translations[lang][key]) {
            element.innerText = translations[lang][key];
        }
    });

    // Update placeholders and dropdown options
    document.getElementById("location").placeholder = translations[lang].location;
    document.querySelectorAll("#charging-type option").forEach((option) => {
        const key = option.getAttribute("data-translate");
        if (translations[lang][key]) {
            option.innerText = translations[lang][key];
        }
    });
}

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.querySelector("#search-form input[type='text']");
    const mainSection = document.querySelector("main");

    // Event listener for input
    searchInput.addEventListener("input", () => {
        // Check if the input has a value
        if (searchInput.value.trim() !== "") {
            mainSection.classList.add("visible"); // Add the visible class
        } else {
            mainSection.classList.remove("visible"); // Hide if input is cleared
        }
    });
});
