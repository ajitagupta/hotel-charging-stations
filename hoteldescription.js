// Initialize Flatpickr calendar for check-in and check-out dates
flatpickr("#checkin", { enableTime: false, dateFormat: "Y-m-d" });
flatpickr("#checkout", { enableTime: false, dateFormat: "Y-m-d" });

document.getElementById("booking-form").addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent form submission

    // Get input values
    const checkin = document.getElementById("checkin").value;
    const checkout = document.getElementById("checkout").value;
    const chargerBooked = document.getElementById("charger").checked;

    // Validate input
    if (!checkin || !checkout) {
        alert("Please select both check-in and check-out dates.");
        return;
    }

    // Static data for Mandarin Oriental Palace, Luzern
    const hotelData = {
        hotel_name: "Mandarin Oriental Palace, Luzern",
        address: "Haldenstrasse 10, 6006 Lucerne, Switzerland",
        price_per_night: 450,
        url: "https://www.booking.com/hotel/ch/mandarin-oriental-palace-luzern.html"
    };

    // Display hotel information
    displayHotelInfo(hotelData, chargerBooked);
});

function displayHotelInfo(hotel, chargerBooked) {
    const chargerMessage = chargerBooked
        ? "<p style='color: green; font-weight: bold;'>Charging Station Reserved ✅</p>"
        : "";

    document.getElementById("hotel-info").innerHTML = `
        <h2>${hotel.hotel_name}</h2>
        <p>${hotel.address}</p>
        <p>Price per night: $${hotel.price_per_night}</p>
        ${chargerMessage}
        <a href="${hotel.url}" target="_blank">
            <button class="btn btn-primary">Book Now</button>
        </a>
    `;
}
