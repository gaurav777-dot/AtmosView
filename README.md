# SkyPulse — Advanced Live Weather Dashboard

## Development Method
Requirement → Planning → UI/Structure → Coding → Testing → Debugging → Version Control → Deployment → Maintenance/Updates

## Features
- Responsive navigation bar with mobile menu
- Live city search (default city: Gaya)
- Open-Meteo geocoding + weather API
- OpenStreetMap Nominatim reverse geocoding for "Use my location", with a graceful fallback if unavailable
- Current temperature, feels-like temperature, humidity, wind and coordinates
- Current date and a live, timezone-aware digital clock for the city being viewed
- Celsius/Fahrenheit switching
- Dark/light theme with localStorage
- Browser geolocation (low-accuracy, 10s timeout, 5-minute cached position)
- Popular-city quick search
- Weather-code icons and descriptions
- Wind/daylight insights
- Loading state and animated spinner
- Error handling and retry
- Toast notifications
- Defensive, null-checked DOM access throughout script.js
- CSS gradients, glassmorphism, shadows, transitions, transforms, animations, media queries
- Responsive desktop/tablet/mobile layout
- No framework required

## Files
- index.html
- style.css
- script.js

## Run
Open `index.html` in a modern browser. For geolocation, a secure context (HTTPS or localhost) may be required.

## API
Open-Meteo public API is used for geocoding and weather data. OpenStreetMap Nominatim is used only for
reverse geocoding when a visitor grants location access; if it is unavailable, the weather still loads
under a generic "Your Location" label.
