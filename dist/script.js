const button = document.querySelector('.find-me');
const alert = document.querySelector('.status');
const addressBox = document.querySelector('.my-address');
const weatherBox = document.querySelector('.weather-box');

// Function to get the user's geolocation
function geoFindMe() {
    alert.innerHTML = 'Loading...';
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    } else {
        alert.innerHTML = 'Geolocation not supported by the browser';
    }
}

// Function to handle successful geolocation retrieval
async function success(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    alert.innerHTML = `Latitude: ${latitude}, Longitude: ${longitude}`;

    try {
        // Send the coordinates to the Netlify function
        const response = await fetch('http://localhost:8888/.netlify/functions/getData', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude, longitude }),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch data, status: ${response.status}`);
        }

        const data = await response.json();
        const { address, weather } = data;
        const addressData = data.address;
        const weatherData = data.weather;
        const addr = addressData.display_name;
        updateMap(latitude, longitude, addr)

        // Update the address
        addressBox.innerHTML = `Address: ${addr}`;
       const days = weatherData.forecast.forecastday

        // Update the weather forecast
        weatherBox.innerHTML = ''; // Clear previous weather data
        days.forEach(day => {
            let html = `<p>Date: ${day.date}</p>
                        <p>Temp: ${day.day.avgtemp_c} °C</p>`;
            weatherBox.innerHTML += html;
        });
    } catch (error) {
        alert.innerHTML = `Error: ${error.message}`;
    }
}

// Function to handle geolocation errors
function error(err) {
    alert.innerHTML = `Error ${err.code}: ${err.message}`;
}


const map = L.map('map').setView([51.505, -0.09], 13); // Example: London

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function updateMap(lat, lon, address) {
    // Center the map on the new position
    map.setView([lat, lon], 13);

    // Add a marker to the map
    L.marker([lat, lon]).addTo(map)
        .bindPopup(`<b>Address:</b><br>${address}`)
        .openPopup();
}


button.addEventListener('click', geoFindMe);
