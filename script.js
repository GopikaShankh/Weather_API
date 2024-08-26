const apiKey = 'cf917c58ca35c35dada70eff06a4f530';
const mapboxToken= 'pk.eyJ1IjoiYWFuY2hhbHNpbmdoIiwiYSI6ImNtMDg5dnEyZjFieTYya3IwcmVocnNncm4ifQ.WaN-Xu1Rizg7FegDr7yXnA'; // Replace this with your Mapbox public token

const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const cityNameDisplay = document.getElementById('city-name-display');
const forecastContainer = document.querySelector('.forecast-container');
const currentWeatherDiv = document.getElementById('current-weather');
const forecastDiv = document.getElementById('forecast');
const mapContainer = document.getElementById('map-container');

// Event listeners for navbar links
document.getElementById('show-current-weather').addEventListener('click', () => {
    currentWeatherDiv.style.display = 'block';
    forecastDiv.style.display = 'none';
    mapContainer.style.display = 'none';
});

document.getElementById('show-forecast').addEventListener('click', () => {
    currentWeatherDiv.style.display = 'none';
    forecastDiv.style.display = 'block';
    mapContainer.style.display = 'none';
});

document.getElementById('show-location').addEventListener('click', () => {
    currentWeatherDiv.style.display = 'none';
    forecastDiv.style.display = 'none';
    mapContainer.style.display = 'block';
});

// Search button click event
searchBtn.addEventListener('click', () => {
    handleSearch();
});

// Enter key press event
cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

function handleSearch() {
    const city = cityInput.value.trim().toUpperCase();
    if (city) {
        displayCityName(city);
        getWeather(city);
        getForecast(city); 
        showMap(city);  
    } else {
        alert('Please enter a city.');
    }
}

function displayCityName(city) {
    cityNameDisplay.innerHTML = '';

    for (const letter of city) {
        const span = document.createElement('span');
        span.textContent = letter;
        cityNameDisplay.appendChild(span);
    }
}

async function getWeather(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        if (!response.ok) {
            throw new Error(`City not found: ${city}`);
        }
        const data = await response.json();

        document.getElementById('temperature-celsius').textContent = `${data.main.temp}°C`;
        document.getElementById('weather-conditions').textContent = data.weather[0].description;
        document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    } catch (error) {
        console.error('Error fetching weather:', error);
        alert('Failed to fetch weather data. Please try again.');
    }
}

async function getForecast(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
        if (!response.ok) {
            throw new Error(`City not found: ${city}`);
        }
        const data = await response.json();

        forecastContainer.innerHTML = ''; 

        for (let i = 0; i < data.list.length; i += 8) { 
            const dayData = data.list[i];
            const nightData = data.list[i + 4] || dayData; 
            
            const dayElement = document.createElement('div');
            dayElement.classList.add('day');

            dayElement.innerHTML = `
                <h3>${new Date(dayData.dt_txt).toLocaleDateString()}</h3>
                <p>Day: ${dayData.main.temp}°C</p>
                <p>Night: ${nightData.main.temp}°C</p>
                <p>${dayData.weather[0].description}</p>
                <img src="https://openweathermap.org/img/wn/${dayData.weather[0].icon}@2x.png" alt="Weather Icon">
            `;
            forecastContainer.appendChild(dayElement);
        }
    } catch (error) {
        console.error('Error fetching forecast:', error);
        alert('Failed to fetch forecast data. Please try again.');
    }
}

function showMap(city) {
    mapContainer.style.display = 'block'; 

    mapContainer.innerHTML = ''; 

    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
        container: mapContainer,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [0, 0], 
        zoom: 10
    });

    // Fetch location coordinates and center the map on the searched city
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(city)}.json?access_token=${mapboxToken}`)
        .then(response => response.json())
        .then(data => {
            if (data.features.length > 0) {
                const coordinates = data.features[0].center;
                map.setCenter(coordinates);
                new mapboxgl.Marker()
                    .setLngLat(coordinates)
                    .addTo(map);
            } else {
                alert('Location not found.');
            }
        })
        .catch(error => {
            console.error('Error fetching location:', error);
            alert('Failed to fetch location data. Please try again.');
        });
}