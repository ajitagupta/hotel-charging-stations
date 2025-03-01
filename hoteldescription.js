document.addEventListener("DOMContentLoaded", function () {
    // Ensure Flatpickr is loaded before initializing
    if (typeof flatpickr !== "undefined") {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0];

        // Initialize Flatpickr with today's date as default
        flatpickr("#checkin", { 
            enableTime: false, 
            dateFormat: "Y-m-d", 
            defaultDate: today 
        });

        flatpickr("#checkout", { 
            enableTime: false, 
            dateFormat: "Y-m-d", 
            defaultDate: today 
        });
    } else {
        console.error("Flatpickr failed to load!");
    }

    // Set hotel name
    const urlParams = new URLSearchParams(window.location.search);
    const hotelSlug = urlParams.get("hotel");

    // Ensure we have a valid slug before updating the title
    if (hotelSlug) {
        document.getElementById("hotel-title").innerText = hotelSlug.replace(/-/g, " "); // Replace dashes with spaces
    } else {
        document.getElementById("hotel-title").innerText = "Hotel Not Found";
    }

    document.getElementById("booking-form").addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent form from submitting normally

        // Extract hotel name from the div
        const hotelName = document.getElementById("hotel-title").innerText.trim();

        // Get selected check-in and check-out dates
        const startDate = document.getElementById("checkin").value;
        const endDate = document.getElementById("checkout").value;

        // Ensure dates are selected
        if (!startDate || !endDate) {
            alert("Please select a check-in and check-out date.");
            return;
        }

        // Construct the URL for the React app
        const reactAppUrl = `http://localhost:3000/booking?hotel=${encodeURIComponent(hotelName)}&start_date=${startDate}&end_date=${endDate}`;

        // Debugging: Log the redirect URL
        console.log("Redirecting to:", reactAppUrl);

        // Redirect to the React app
        window.location.href = reactAppUrl;
    });
});
