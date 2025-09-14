// Route calculation constants
const ROUTE_DATA = {
    walking: {
        icon: '🚶‍♂️',
        name: 'Walking',
        speed: 5, // km/h
        carbonPerKm: 0, // kg CO2
        caloriesPerKm: 50, // calories
        costPerKm: 0, // dollars
        color: 'walking'
    },
    cycling: {
        icon: '🚲',
        name: 'Cycling',
        speed: 15, // km/h
        carbonPerKm: 0, // kg CO2
        caloriesPerKm: 30, // calories
        costPerKm: 0.1, // dollars (maintenance)
        color: 'cycling'
    },
    driving: {
        icon: '🚗',
        name: 'Driving',
        speed: 30, // km/h (city average)
        carbonPerKm: 0.2, // kg CO2
        caloriesPerKm: 0, // calories
        costPerKm: 0.5, // dollars (gas + maintenance)
        color: 'driving'
    },
    public: {
        icon: '🚌',
        name: 'Public Transport',
        speed: 20, // km/h (average with stops)
        carbonPerKm: 0.1, // kg CO2
        caloriesPerKm: 5, // calories (walking to stops)
        costPerKm: 0.3, // dollars
        color: 'public'
    }
};

// Real API integration for accurate calculations
const API_CONFIG = {
    openRouteService: {
        apiKey: API_KEYS.openRouteService,
        baseUrl: 'https://api.openrouteservice.org/v2/directions'
    },
    weather: {
        apiKey: API_KEYS.openWeather,
        baseUrl: 'https://api.openweathermap.org/data/2.5/weather'
    },
    traffic: {
        apiKey: API_KEYS.tomtom,
        baseUrl: 'https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json'
    }
};

// Real distance calculation using OpenRouteService API (FREE!)
async function getRealDistance(start, end) {
    try {
        // Check if API key is properly set
        if (!API_CONFIG.openRouteService.apiKey || API_CONFIG.openRouteService.apiKey.includes('YOUR_OPENROUTE_API_KEY')) {
            console.log('OpenRouteService API key not set, using fallback');
            return getFallbackDistance(start, end);
        }
        
        console.log('Using OpenRouteService API with key:', API_CONFIG.openRouteService.apiKey.substring(0, 20) + '...');

        // First, geocode the addresses to get coordinates
        const startCoords = await geocodeAddress(start);
        const endCoords = await geocodeAddress(end);
        
        if (!startCoords || !endCoords) {
            console.log('Geocoding failed, using fallback');
            return getFallbackDistance(start, end);
        }

        // Use OpenRouteService Directions API
        const url = `${API_CONFIG.openRouteService.baseUrl}/driving-car`;
        const requestBody = {
            coordinates: [startCoords, endCoords],
            format: 'json',
            units: 'km'
        };

        console.log('Fetching distance from OpenRouteService:', url);
        console.log('Request body:', requestBody);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': API_CONFIG.openRouteService.apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('OpenRouteService API response:', data);
        
        if (data.features && data.features[0] && data.features[0].properties) {
            const properties = data.features[0].properties;
            return {
                distance: properties.summary.distance,
                duration: properties.summary.duration / 60, // Convert seconds to minutes
                status: 'success'
            };
        } else {
            console.error('OpenRouteService API error:', data);
            throw new Error(`API request failed: ${data.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.warn('Using fallback distance calculation:', error);
        return getFallbackDistance(start, end);
    }
}

// Geocode address using OpenRouteService Geocoding API
async function geocodeAddress(address) {
    try {
        const url = `https://api.openrouteservice.org/geocode/search?api_key=${API_CONFIG.openRouteService.apiKey}&text=${encodeURIComponent(address)}`;
        console.log('Geocoding address:', address, 'URL:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        console.log('Geocoding response:', data);
        
        if (data.features && data.features[0] && data.features[0].geometry) {
            const coords = data.features[0].geometry.coordinates;
            console.log('Found coordinates for', address, ':', coords);
            return [coords[0], coords[1]]; // [longitude, latitude]
        }
        
        console.log('No coordinates found for:', address);
        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

// Get route geometry from OpenRouteService Directions API
async function getRouteGeometry(startCoords, endCoords) {
    try {
        const url = 'https://api.openrouteservice.org/v2/directions/driving-car/json';
        const requestBody = {
            coordinates: [startCoords, endCoords],
            format: 'geojson',
            options: {
                avoid_features: [],
                avoid_borders: 'none',
                avoid_countries: [],
                avoid_tolls: false,
                avoid_highways: false
            }
        };
        
        console.log('Fetching route geometry from OpenRouteService:', url);
        console.log('Request body:', requestBody);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': API_CONFIG.openRouteService.apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('Route geometry response status:', response.status);
        const data = await response.json();
        console.log('Route geometry response:', data);
        
        if (data.features && data.features[0] && data.features[0].geometry && data.features[0].geometry.coordinates) {
            const coordinates = data.features[0].geometry.coordinates;
            console.log('Found route geometry with', coordinates.length, 'points');
            return coordinates;
        }
        
        console.log('No route geometry found');
        return null;
    } catch (error) {
        console.error('Route geometry error:', error);
        return null;
    }
}

// Fallback distance calculation for demo purposes
function getFallbackDistance(start, end) {
    const SAMPLE_DISTANCES = {
        'downtown toronto': {
            'university of toronto': 2.5,
            'cn tower': 1.2,
            'royal ontario museum': 3.1,
            'toronto island': 4.8,
            'university of waterloo': 108.5, // Real distance Toronto to Waterloo
            'waterloo': 108.5,
            'uw': 108.5
        },
        'university of toronto': {
            'downtown toronto': 2.5,
            'cn tower': 3.2,
            'royal ontario museum': 0.8,
            'toronto island': 6.1,
            'university of waterloo': 106.2,
            'waterloo': 106.2,
            'uw': 106.2
        },
        'toronto': {
            'waterloo': 108.5,
            'university of waterloo': 108.5,
            'uw': 108.5
        }
    };
    
    const startKey = start.toLowerCase();
    const endKey = end.toLowerCase();
    
    // Check for exact matches first
    if (SAMPLE_DISTANCES[startKey] && SAMPLE_DISTANCES[startKey][endKey]) {
        return {
            distance: SAMPLE_DISTANCES[startKey][endKey],
            duration: SAMPLE_DISTANCES[startKey][endKey] * 1.2, // More realistic driving time
            status: 'fallback'
        };
    }
    
    // Check for partial matches (e.g., "toronto" matches "downtown toronto")
    for (const [startLocation, destinations] of Object.entries(SAMPLE_DISTANCES)) {
        if (startKey.includes(startLocation) || startLocation.includes(startKey)) {
            for (const [destLocation, distance] of Object.entries(destinations)) {
                if (endKey.includes(destLocation) || destLocation.includes(endKey)) {
                    return {
                        distance: distance,
                        duration: distance * 1.2,
                        status: 'fallback'
                    };
                }
            }
        }
    }
    
    // Random distance for unknown routes (but make it more realistic)
    const randomDistance = Math.random() * 50 + 5; // 5-55 km range
    return {
        distance: randomDistance,
        duration: randomDistance * 1.2,
        status: 'random'
    };
}

// Real weather API integration
async function getRealWeather(city = 'Toronto') {
    try {
        // Check if API key is properly set
        if (!API_CONFIG.weather.apiKey || API_CONFIG.weather.apiKey.includes('YOUR_')) {
            console.log('Weather API key not set, using fallback');
            return getFallbackWeather();
        }

        const url = `${API_CONFIG.weather.baseUrl}?q=${encodeURIComponent(city)}&appid=${API_CONFIG.weather.apiKey}&units=metric`;
        console.log('Fetching weather from:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('Weather API response:', data);
        
        if (data.cod === 200) {
            return {
                condition: data.weather[0].main.toLowerCase(),
                temperature: Math.round(data.main.temp),
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                status: 'success'
            };
        } else {
            console.error('Weather API error:', data);
            throw new Error(`Weather API request failed: ${data.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.warn('Using fallback weather data:', error);
        return getFallbackWeather();
    }
}

// Fallback weather simulation
function getFallbackWeather() {
    const conditions = ['sunny', 'cloudy', 'rainy', 'snowy'];
    return {
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        temperature: Math.floor(Math.random() * 30) - 5, // -5 to 25°C
        humidity: Math.floor(Math.random() * 100),
        windSpeed: Math.random() * 20,
        status: 'fallback'
    };
}

function getWeatherIcon(condition) {
    const icons = {
        'clear': '☀️',
        'sunny': '☀️',
        'clouds': '☁️',
        'cloudy': '☁️',
        'rain': '🌧️',
        'drizzle': '🌦️',
        'snow': '❄️',
        'thunderstorm': '⛈️',
        'mist': '🌫️',
        'fog': '🌫️'
    };
    return icons[condition] || '🌤️';
}

function getWeatherRecommendation(weatherData) {
    const { condition, temperature, humidity, windSpeed } = weatherData;
    
    let recommendation = '';
    
    if (condition === 'clear' || condition === 'sunny') {
        recommendation = 'Perfect weather for walking or cycling!';
    } else if (condition === 'clouds' || condition === 'cloudy') {
        recommendation = 'Good conditions for any transport mode.';
    } else if (condition === 'rain' || condition === 'drizzle') {
        recommendation = 'Consider public transport or driving today.';
    } else if (condition === 'snow') {
        recommendation = 'Driving or public transport recommended for safety.';
    } else {
        recommendation = 'Check current conditions before choosing your route.';
    }
    
    // Add temperature context
    if (temperature < 0) {
        recommendation += ' Bundle up - it\'s freezing!';
    } else if (temperature > 25) {
        recommendation += ' Stay hydrated - it\'s hot out there!';
    }
    
    return recommendation;
}

// Utility functions
function getDistance(start, end) {
    const startKey = start.toLowerCase();
    const endKey = end.toLowerCase();
    
    // Check if we have sample data
    if (SAMPLE_DISTANCES[startKey] && SAMPLE_DISTANCES[startKey][endKey]) {
        return SAMPLE_DISTANCES[startKey][endKey];
    }
    
    // Default distance for unknown routes
    return Math.random() * 10 + 1; // Random distance between 1-11 km
}

function calculateRouteMetrics(mode, distance) {
    const data = ROUTE_DATA[mode];
    const time = (distance / data.speed) * 60; // minutes
    const carbon = distance * data.carbonPerKm;
    const calories = distance * data.caloriesPerKm;
    const cost = distance * data.costPerKm;
    
    return {
        distance: distance.toFixed(1),
        time: Math.round(time),
        carbon: carbon.toFixed(2),
        calories: Math.round(calories),
        cost: cost.toFixed(2)
    };
}

function createRouteCard(mode, metrics) {
    const data = ROUTE_DATA[mode];
    
    return `
        <div class="route-card ${data.color}" data-mode="${mode}">
            <div class="route-header">
                <div class="route-header-left">
                    <span class="route-icon">${data.icon}</span>
                    <span class="route-title">${data.name}</span>
                </div>
                <span class="selection-indicator">👆 Click to select</span>
            </div>
            <div class="route-metrics">
                <div class="metric">
                    <span class="metric-label">Distance:</span>
                    <span class="metric-value">${metrics.distance} km</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Time:</span>
                    <span class="metric-value">${metrics.time} min</span>
                </div>
                <div class="metric">
                    <span class="metric-label">CO₂ Emissions:</span>
                    <span class="metric-value ${metrics.carbon == 0 ? 'good' : 'bad'}">${metrics.carbon} kg</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Calories:</span>
                    <span class="metric-value good">${metrics.calories}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Cost:</span>
                    <span class="metric-value">$${metrics.cost}</span>
                </div>
            </div>
        </div>
    `;
}

function calculateSummary(allMetrics) {
    const drivingMetrics = allMetrics.find(m => m.mode === 'driving');
    const bestEcoMetrics = allMetrics.find(m => m.mode === 'walking') || allMetrics.find(m => m.mode === 'cycling');
    
    if (!drivingMetrics || !bestEcoMetrics) return { co2Saved: 0, caloriesBurned: 0, moneySaved: 0 };
    
    const co2Saved = (drivingMetrics.carbon - bestEcoMetrics.carbon).toFixed(2);
    const caloriesBurned = bestEcoMetrics.calories;
    const moneySaved = (drivingMetrics.cost - bestEcoMetrics.cost).toFixed(2);
    
    return { co2Saved, caloriesBurned, moneySaved };
}

function updateSummary(summary) {
    document.getElementById('co2Saved').textContent = `${summary.co2Saved} kg`;
    document.getElementById('caloriesBurned').textContent = `${summary.caloriesBurned} cal`;
    document.getElementById('moneySaved').textContent = `$${summary.moneySaved}`;
    
    // Check for achievements
    checkAchievements(summary);
}

function checkAchievements(summary) {
    const achievements = [];
    
    if (parseFloat(summary.co2Saved) > 0.5) {
        achievements.push('🌱 Eco Warrior: Saved over 0.5kg CO₂!');
    }
    
    if (summary.caloriesBurned > 100) {
        achievements.push('🏃‍♂️ Fitness Champion: Burned over 100 calories!');
    }
    
    if (parseFloat(summary.moneySaved) > 1) {
        achievements.push('💰 Money Saver: Saved over $1!');
    }
    
    if (achievements.length > 0) {
        // Show achievement notification
        setTimeout(() => {
            alert('🏆 Achievement Unlocked!\n\n' + achievements.join('\n'));
        }, 2000);
    }
}

function showLoading() {
    const btn = document.getElementById('calculateBtn');
    btn.innerHTML = '<span class="loading"></span> Calculating...';
    btn.disabled = true;
}

function hideLoading() {
    const btn = document.getElementById('calculateBtn');
    btn.innerHTML = 'Calculate Routes';
    btn.disabled = false;
}


// AI Chat Functions
function addAIMessage(message, type = 'ai') {
    console.log('addAIMessage called:', message, type);
    const chatMessages = document.getElementById('ai-chat-messages');
    if (!chatMessages) {
        console.log('ai-chat-messages element not found');
        return;
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    
    const time = new Date().toLocaleTimeString();
    
    const avatar = type === 'ai' ? '🌱' : ''; // AI avatar for AI messages, no avatar for user messages
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            <div class="message-text">${message.replace(/\n/g, '<br>')}</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Auto-scroll to bottom
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

function sendToAI() {
    console.log('sendToAI called');
    const input = document.getElementById('ai-chat-input');
    if (!input) {
        console.log('ai-chat-input element not found');
        return;
    }
    
    const userMessage = input.value.trim();
    
    if (userMessage) {
        // Add user message
        addAIMessage(userMessage, 'user');
        
        // AI Response with delay for realism
        setTimeout(() => {
            const aiResponse = generateAdvancedAIResponse(userMessage);
            addAIMessage(aiResponse);
            
            // Voice response (without emojis)
            if (voiceAI.synthesis) {
                const cleanText = removeEmojis(aiResponse);
                voiceAI.speak(cleanText);
            }
        }, 1000 + Math.random() * 1000);
        
        input.value = '';
    }
}

function generateAdvancedAIResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Get real user stats from localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentEcoUser') || 'null');
    const userRoutes = JSON.parse(localStorage.getItem('ecoRoutes') || '[]');
    
    // Calculate actual user stats (using userName to match the data structure)
    const userRoutesForCurrentUser = userRoutes.filter(route => route.userName === currentUser?.username);
    const totalRoutes = userRoutesForCurrentUser.length;
    const totalCo2Saved = userRoutesForCurrentUser.reduce((sum, route) => sum + (parseFloat(route.co2Saved) || 0), 0);
    const totalCaloriesBurned = userRoutesForCurrentUser.reduce((sum, route) => sum + (parseInt(route.caloriesBurned) || 0), 0);
    const totalMoneySaved = userRoutesForCurrentUser.reduce((sum, route) => sum + (parseFloat(route.moneySaved) || 0), 0);
    
    console.log('Real user stats:', { totalRoutes, totalCo2Saved, totalCaloriesBurned, totalMoneySaved });
    
    // Route-related queries
    if (message.includes('route') || message.includes('bike') || message.includes('cycling')) {
        return "Great question! Based on your preferences, I recommend the cycling route - it's perfect for today's weather and will save lots of CO₂.";
    }
    
    // Progress queries
    if (message.includes('progress') || message.includes('doing') || message.includes('stats')) {
        if (totalRoutes === 0) {
            return `You haven't logged any routes yet! Start by calculating a route and clicking on your preferred option to log it. Let's make your first eco-friendly journey!`;
        } else {
            return `You're doing amazing! You've completed ${totalRoutes} routes and saved ${totalCo2Saved.toFixed(1)}kg of CO₂.\n\nYou've also burned ${totalCaloriesBurned} calories and saved $${totalMoneySaved.toFixed(2)}.\n\nKeep up the great work!`;
        }
    }
    
    // Challenge queries
    if (message.includes('challenge') || message.includes('goal')) {
        return aiGamification.getDailyChallenge();
    }
    
    // Achievement queries
    if (message.includes('achievement') || message.includes('badge')) {
        const achievements = userStats.achievements;
        if (achievements.length > 0) {
            return `You have ${achievements.length} achievements! You're becoming a true eco-warrior!`;
        } else {
            return "Complete your first eco-route to unlock your first achievement!";
        }
    }
    
    // Weather queries
    if (message.includes('weather') || message.includes('rain') || message.includes('sunny')) {
        const weather = getCurrentWeather();
        return `Today's weather is ${weather.condition}! Perfect for ${weather.condition === 'sunny' ? 'cycling' : 'walking or public transport'}.`;
    }
    
    // Default responses
    const defaultResponses = [
        "I'm here to help you make more sustainable choices! What would you like to know?",
        "Let's make today more eco-friendly! How can I help?",
        "Ready to save the planet together? Ask me anything!",
        "I love your eco-conscious thinking! What's on your mind?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendToAI();
    }
}

function askAI(question) {
    const input = document.getElementById('ai-chat-input');
    if (input) {
        input.value = question;
        sendToAI();
    }
}

function toggleVoice() {
    if (voiceAI.isListening) {
        voiceAI.stopListening();
    } else {
        voiceAI.startListening();
    }
}

function startVoiceInput() {
    voiceAI.startListening();
}

function openAISettings() {
    aiNotifications.showAIMessage("AI Settings coming soon! For now, I'm here to help with your eco-routes!", 'info');
}

// Function to remove emojis from text for voice output
function removeEmojis(text) {
    return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
}

// Custom route visualization function
function showCustomRouteVisualization(startLocation, endLocation, allMetrics) {
    try {
        const mapSection = document.getElementById('map-section');
        if (!mapSection) {
            console.error('Map section not found');
            return;
        }
        
        // Show the route visualization section
        mapSection.style.display = 'block';
        
        // Update start and end labels
        document.getElementById('start-label').textContent = startLocation;
        document.getElementById('end-label').textContent = endLocation;
        
        // Calculate average distance and time from all routes
        let totalDistance = 0;
        let totalTime = 0;
        let routeCount = 0;
        
        allMetrics.forEach(metrics => {
            if (metrics.distance && metrics.time) {
                totalDistance += parseFloat(metrics.distance);
                totalTime += parseInt(metrics.time);
                routeCount++;
            }
        });
        
        const avgDistance = routeCount > 0 ? (totalDistance / routeCount).toFixed(1) : '--';
        const avgTime = routeCount > 0 ? Math.round(totalTime / routeCount) : '--';
        
        // Update route information
        document.getElementById('route-distance').textContent = `${avgDistance} km`;
        document.getElementById('route-duration').textContent = `${avgTime} min`;
        
        // Update route summary
        const bestEcoRoute = allMetrics.find(m => m.mode === 'walking') || allMetrics.find(m => m.mode === 'cycling');
        if (bestEcoRoute) {
            document.getElementById('route-summary').textContent = 
                `Best eco-route: ${bestEcoRoute.mode} (${bestEcoRoute.distance}km, ${bestEcoRoute.time}min)`;
        } else {
            document.getElementById('route-summary').textContent = 'Route calculated successfully';
        }
        
        // Update eco impact message - calculate CO2 savings vs driving
        const drivingRoute = allMetrics.find(m => m.mode === 'driving');
        const ecoRoutes = allMetrics.filter(m => m.mode !== 'driving');
        
        let co2Saved = 0;
        let caloriesBurned = 0;
        
        if (drivingRoute && ecoRoutes.length > 0) {
            const drivingCarbon = parseFloat(drivingRoute.carbon);
            const bestEcoRoute = ecoRoutes.reduce((best, current) => 
                parseFloat(current.carbon) < parseFloat(best.carbon) ? current : best
            );
            co2Saved = drivingCarbon - parseFloat(bestEcoRoute.carbon);
            caloriesBurned = ecoRoutes.reduce((total, route) => total + parseInt(route.calories), 0);
        }
        
        if (co2Saved > 0 || caloriesBurned > 0) {
            document.getElementById('eco-impact').textContent = 
                `Save ${co2Saved.toFixed(2)}kg CO₂ and burn ${caloriesBurned} calories with eco-routes!`;
        } else {
            document.getElementById('eco-impact').textContent = 'Eco-friendly route options available';
        }
        
        console.log('Custom route visualization displayed successfully');
        
    } catch (error) {
        console.error('Error showing custom route visualization:', error);
    }
}

// Custom route visualization function
function showCustomRouteVisualization(start, end, allMetrics) {
    try {
        console.log('Showing custom route visualization:', start, 'to', end);
        
        // Update start and end labels
        document.getElementById('start-label').textContent = start;
        document.getElementById('end-label').textContent = end;
        
        // Use the first route's distance (same for all modes) and fastest time
        const firstRoute = allMetrics[0];
        if (firstRoute) {
            // Distance is the same for all modes
            document.getElementById('route-distance').textContent = firstRoute.distance + ' km';
            
            // Find the fastest time among all modes
            const fastestTime = Math.min(...allMetrics.map(m => parseInt(m.time)));
            document.getElementById('route-duration').textContent = fastestTime + ' min';
        }
        
        // Find the best eco route and driving route for comparison
        const walkingRoute = allMetrics.find(m => m.mode === 'walking');
        const cyclingRoute = allMetrics.find(m => m.mode === 'cycling');
        const drivingRoute = allMetrics.find(m => m.mode === 'driving');
        
        const bestEcoRoute = walkingRoute || cyclingRoute;
        
        if (bestEcoRoute && drivingRoute) {
            const co2Saved = drivingRoute.carbon - bestEcoRoute.carbon;
            const caloriesBurned = bestEcoRoute.calories;
            
            document.getElementById('route-summary').textContent = 
                `Best eco-route: ${bestEcoRoute.mode} (${bestEcoRoute.distance}km, ${bestEcoRoute.time}min)`;
            
            document.getElementById('eco-impact').textContent = 
                `Save ${co2Saved.toFixed(2)}kg CO₂ and burn ${caloriesBurned} calories with eco-routes!`;
        } else {
            document.getElementById('route-summary').textContent = 'Route calculated successfully';
            document.getElementById('eco-impact').textContent = 'Eco-friendly route options available';
        }
        
        console.log('Custom route visualization updated successfully');
    } catch (error) {
        console.error('Error showing custom route visualization:', error);
    }
}

// Function to geocode address to coordinates
function geocodeAddress(address, callback) {
    try {
        if (typeof google === 'undefined' || !google.maps) {
            console.error('Google Maps not available for geocoding');
            callback({ lat: 43.6532, lng: -79.3832 });
            return;
        }
        
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: address }, function(results, status) {
            if (status === 'OK' && results[0]) {
                callback(results[0].geometry.location);
            } else {
                console.error('Geocoding failed for address: ' + address + ', status: ' + status);
                // Fallback to Toronto coordinates
                callback({ lat: 43.6532, lng: -79.3832 });
            }
        });
    } catch (error) {
        console.error('Error in geocoding:', error);
        callback({ lat: 43.6532, lng: -79.3832 });
    }
}

// Test function to check if AI is working
function testAI() {
    console.log('Testing AI system...');
    console.log('ecoCoach:', ecoCoach);
    console.log('aiRouteAnalyzer:', aiRouteAnalyzer);
    console.log('userLearning:', userLearning);
    console.log('aiGamification:', aiGamification);
    console.log('aiNotifications:', aiNotifications);
    console.log('voiceAI:', voiceAI);
    
    // Test AI response
    const testResponse = ecoCoach.getResponse('greeting');
    console.log('Test response:', testResponse);
    
    // Test notification
    aiNotifications.showAIMessage("AI system is working! 🌱", 'success');
    
    // Test chat message
    addAIMessage("Test message from AI system! 🤖");
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Get current user from auth.js
    const currentUser = JSON.parse(localStorage.getItem('currentEcoUser') || 'null');
    
    // Check authentication first
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Update welcome message
    if (currentUser) {
        document.getElementById('welcome-user').textContent = `Welcome, ${currentUser.username}!`;
    }
    
    const calculateBtn = document.getElementById('calculateBtn');
    calculateBtn.addEventListener('click', calculateRoutes);
    
    // Allow Enter key to trigger calculation
    document.getElementById('start').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') calculateRoutes();
    });
    
    document.getElementById('end').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') calculateRoutes();
    });
    
    // Add some sample suggestions
    const startInput = document.getElementById('start');
    const endInput = document.getElementById('end');
    
    startInput.addEventListener('focus', function() {
        if (!this.value) {
            this.placeholder = 'Try: Downtown Toronto, CN Tower, University of Toronto';
        }
    });
    
    endInput.addEventListener('focus', function() {
        if (!this.value) {
            this.placeholder = 'Try: University of Toronto, Royal Ontario Museum, Toronto Island';
        }
    });
    
    // Log route button
    const logRouteBtn = document.getElementById('log-route-btn');
    if (logRouteBtn) {
        logRouteBtn.addEventListener('click', logRoute);
    }
    
    // Advanced AI Welcome
    setTimeout(() => {
        console.log('Starting AI welcome sequence...');
        console.log('Current user:', currentUser);
        
        try {
            const userData = { name: currentUser.username };
            console.log('User data for AI:', userData);
            
            const welcomeMessage = ecoCoach.getResponse('greeting', userData);
            console.log('Welcome message:', welcomeMessage);
            addAIMessage(welcomeMessage);
            
            const challenge = aiGamification.getDailyChallenge();
            console.log('Daily challenge:', challenge);
            addAIMessage(challenge);
            
            // Predict user needs
            aiNotifications.predictUserNeeds();
            
            // Suggest optimal route
            setTimeout(() => {
                aiNotifications.suggestOptimalRoute();
            }, 2000);
            
        } catch (error) {
            console.error('AI welcome error:', error);
        }
        
    }, 1000);
});

// Enhanced AI-powered route suggestions
function getAISuggestion(allMetrics) {
    const bestEco = allMetrics.find(m => m.mode === 'walking') || allMetrics.find(m => m.mode === 'cycling');
    const fastest = allMetrics.reduce((prev, current) => (prev.time < current.time) ? prev : current);
    const cheapest = allMetrics.reduce((prev, current) => (prev.cost < current.cost) ? prev : current);
    
    const suggestions = [];
    
    if (bestEco.carbon == 0) {
        suggestions.push(`🌱 ${bestEco.mode} is the most eco-friendly option!`);
    }
    
    if (fastest.mode !== 'driving') {
        suggestions.push(`⚡ ${fastest.mode} is actually faster than driving in this case!`);
    }
    
    if (cheapest.cost == 0) {
        suggestions.push(`💰 ${cheapest.mode} is completely free!`);
    }
    
    return suggestions;
}

// Add dynamic tips based on results
function showDynamicTips(allMetrics) {
    const suggestions = getAISuggestion(allMetrics);
    const tipsContainer = document.querySelector('.tips-grid');
    
    if (suggestions.length > 0) {
        tipsContainer.innerHTML = suggestions.map(suggestion => 
            `<div class="tip">
                <span class="tip-icon">💡</span>
                <p>${suggestion}</p>
            </div>`
        ).join('');
    }
}

// Enhanced route calculation with real data integration
async function calculateRoutes() {
    const start = document.getElementById('start').value.trim();
    const end = document.getElementById('end').value.trim();
    
    if (!start || !end) {
        alert('Please enter both start and end locations');
        return;
    }
    
    showLoading();
    
    try {
        // Get real distance and weather data in parallel
        const [distanceData, weatherData] = await Promise.all([
            getRealDistance(start, end),
            getRealWeather('Toronto') // You can extract city from start location
        ]);
        
        const distance = distanceData.distance;
        const allMetrics = [];
        const routeCardsContainer = document.querySelector('.route-cards');
        
        // Clear previous results
        routeCardsContainer.innerHTML = '';
        
        // Calculate metrics for each transport mode
        Object.keys(ROUTE_DATA).forEach(mode => {
            const metrics = calculateRouteMetrics(mode, distance);
            allMetrics.push({ mode, ...metrics });
            
            const cardHTML = createRouteCard(mode, metrics);
            routeCardsContainer.innerHTML += cardHTML;
        });
        
        // Store all metrics for click-based summary
        allRouteMetrics = allMetrics;
        
        // Add click event listeners to route cards
        addRouteCardListeners(allMetrics);
        
        // Show weather for both locations
        updateWeatherDisplay(start, end, weatherData);
        
        // Show AI suggestions
        showDynamicTips(allMetrics);
        
        // Show results
        document.getElementById('results').style.display = 'block';
        
        // Show map section
        document.getElementById('map-section').style.display = 'block';
        
        // Show custom route visualization
        showCustomRouteVisualization(start, end, allMetrics);
        
        // Scroll to results
        document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error calculating routes:', error);
        alert('Error calculating routes. Please try again.');
    } finally {
        hideLoading();
    }
}

// Add some interactive features
function addEcoTips() {
    const tips = [
        "💡 Walking burns calories and produces zero emissions!",
        "🚲 Cycling is 10x more efficient than walking for longer distances.",
        "🚌 Public transport reduces traffic congestion and emissions.",
        "🌱 Every km you walk instead of drive saves 0.2kg of CO₂!",
        "💰 Walking and cycling can save you hundreds of dollars per year.",
        "🏃‍♂️ Active transportation improves your health and mood!"
    ];
    
    // Randomly show a tip
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    console.log(randomTip);
}

// Initialize tips
addEcoTips();


// Route entry functionality
function showRouteEntrySection(mode, metrics) {
    const routeEntrySection = document.getElementById('route-entry-section');
    const data = ROUTE_DATA[mode];
    
    if (routeEntrySection) {
        // Update route info
        document.getElementById('selected-route-name').textContent = data.name;
        document.getElementById('preview-distance').textContent = `${metrics.distance} km`;
        document.getElementById('preview-co2').textContent = `${metrics.carbon} kg`;
        document.getElementById('preview-calories').textContent = `${metrics.calories} cal`;
        
        
        routeEntrySection.style.display = 'block';
    }
}

// Update user statistics
function updateUserStats(routeEntry) {
    const currentUser = JSON.parse(localStorage.getItem('currentEcoUser') || 'null');
    if (!currentUser) return;
    
    // Calculate stats from all user routes (more accurate)
    const routes = JSON.parse(localStorage.getItem('ecoRoutes') || '[]');
    const userRoutes = routes.filter(route => route.userName === currentUser.username);
    
    let totalCo2 = 0;
    let totalCalories = 0;
    let totalMoney = 0;
    
    userRoutes.forEach(route => {
        totalCo2 += route.co2Saved;
        totalCalories += route.caloriesBurned;
        totalMoney += route.moneySaved;
    });
    
    // Update user stats with calculated values
    currentUser.totalRoutes = userRoutes.length;
    currentUser.totalCo2Saved = totalCo2;
    currentUser.totalCaloriesBurned = totalCalories;
    currentUser.totalMoneySaved = totalMoney;
    
    console.log('Updated user stats:', {
        totalRoutes: userRoutes.length,
        totalCo2Saved: totalCo2,
        totalCaloriesBurned: totalCalories,
        totalMoneySaved: totalMoney
    });
    
    // Update in localStorage
    const users = JSON.parse(localStorage.getItem('ecoRouteUsers') || '[]');
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('ecoRouteUsers', JSON.stringify(users));
        localStorage.setItem('currentEcoUser', JSON.stringify(currentUser));
    }
}

// Log route function
function logRoute() {
    const routeNote = document.getElementById('route-note').value.trim();
    const currentUser = JSON.parse(localStorage.getItem('currentEcoUser') || 'null');
    
    if (!currentUser) {
        alert('Please log in to save your route!');
        return;
    }
    
    if (!selectedRoute) {
        alert('Please select a route first!');
        return;
    }
    
    // Create route entry
    const routeEntry = {
        id: Date.now(),
        userName: currentUser.username,
        routeMode: selectedRoute.mode,
        routeName: ROUTE_DATA[selectedRoute.mode].name,
        distance: parseFloat(selectedRoute.distance),
        co2Saved: parseFloat(selectedRoute.carbon),
        caloriesBurned: parseInt(selectedRoute.calories),
        moneySaved: parseFloat(selectedRoute.cost),
        note: routeNote,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString()
    };
    
    // Add to entries
    routeEntries.push(routeEntry);
    
    // Save to localStorage
    localStorage.setItem('ecoRoutes', JSON.stringify(routeEntries));
    
    // Update user statistics
    updateUserStats(routeEntry);
    
    // Show success message
    showSuccessMessage(`Route logged successfully! You saved ${routeEntry.co2Saved}kg CO₂ and burned ${routeEntry.caloriesBurned} calories! Check your Records page to see updated stats.`);
    
    // Clear form
    document.getElementById('route-note').value = '';
}

// Show success message
function showSuccessMessage(message) {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">🎉</span>
            <span class="notification-text">${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(40, 167, 69, 0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Leaderboard functionality
function showLeaderboard() {
    const leaderboardSection = document.getElementById('leaderboard-section');
    if (leaderboardSection) {
        leaderboardSection.style.display = 'block';
        updateLeaderboard('weekly');
    }
}

function updateLeaderboard(timeframe) {
    const leaderboardList = document.getElementById('leaderboard-list');
    if (!leaderboardList) return;
    
    // Filter entries by timeframe
    let filteredEntries = [...routeEntries];
    const now = new Date();
    
    if (timeframe === 'weekly') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredEntries = routeEntries.filter(entry => new Date(entry.timestamp) >= weekAgo);
    } else if (timeframe === 'monthly') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredEntries = routeEntries.filter(entry => new Date(entry.timestamp) >= monthAgo);
    }
    
    // Group by user and calculate totals
    const userStats = {};
    filteredEntries.forEach(entry => {
        if (!userStats[entry.userName]) {
            userStats[entry.userName] = {
                userName: entry.userName,
                totalCo2Saved: 0,
                totalCaloriesBurned: 0,
                totalMoneySaved: 0,
                routeCount: 0,
                routes: []
            };
        }
        
        userStats[entry.userName].totalCo2Saved += entry.co2Saved;
        userStats[entry.userName].totalCaloriesBurned += entry.caloriesBurned;
        userStats[entry.userName].totalMoneySaved += entry.moneySaved;
        userStats[entry.userName].routeCount += 1;
        userStats[entry.userName].routes.push(entry);
    });
    
    // Sort by CO2 saved (primary) and calories burned (secondary)
    const sortedUsers = Object.values(userStats).sort((a, b) => {
        if (b.totalCo2Saved !== a.totalCo2Saved) {
            return b.totalCo2Saved - a.totalCo2Saved;
        }
        return b.totalCaloriesBurned - a.totalCaloriesBurned;
    });
    
    // Display leaderboard
    if (sortedUsers.length === 0) {
        leaderboardList.innerHTML = `
            <div class="no-entries">
                <p>No routes logged yet. Be the first to log an eco-friendly route!</p>
            </div>
        `;
        return;
    }
    
    leaderboardList.innerHTML = sortedUsers.slice(0, 10).map((user, index) => {
        const rank = index + 1;
        const rankClass = rank <= 3 ? `rank-${rank}` : '';
        const latestRoute = user.routes[user.routes.length - 1];
        
        return `
            <div class="leaderboard-entry ${rankClass}">
                <div class="rank-number">${rank}</div>
                <div class="user-info">
                    <div class="user-name">${user.userName}</div>
                    <div class="route-details">Latest: ${latestRoute.routeName} • ${latestRoute.date}</div>
                </div>
                <div class="user-stats">
                    <div class="stat-item">
                        <div class="stat-value">${user.totalCo2Saved.toFixed(1)}</div>
                        <div class="stat-label">CO₂ Saved</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${user.totalCaloriesBurned}</div>
                        <div class="stat-label">Calories</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${user.routeCount}</div>
                        <div class="stat-label">Routes</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Add click event listeners to route cards using event delegation
function addRouteCardListeners(allMetrics) {
    const routeCardsContainer = document.querySelector('.route-cards');
    if (routeCardsContainer && !routeCardsContainer.hasAttribute('data-listeners-added')) {
        // Mark that listeners have been added
        routeCardsContainer.setAttribute('data-listeners-added', 'true');
        
        // Use event delegation - listen on the container
        routeCardsContainer.addEventListener('click', function(event) {
            const routeCard = event.target.closest('.route-card');
            if (routeCard) {
                const mode = routeCard.getAttribute('data-mode');
                const metrics = allRouteMetrics.find(m => m.mode === mode);
                if (metrics) {
                    selectRoute(mode, metrics);
                }
            }
        });
    }
}

// Weather display function with dynamic backgrounds for both locations
async function updateWeatherDisplay(start, end, weatherData) {
    const weatherSection = document.getElementById('weather-section');
    
    if (weatherSection) {
        // Get weather for both locations
        const [startWeather, endWeather] = await Promise.all([
            getRealWeather(extractCityFromLocation(start)),
            getRealWeather(extractCityFromLocation(end))
        ]);
        
        // Update start location weather
        const startWeatherIcon = document.getElementById('start-weather-icon');
        const startWeatherTemp = document.getElementById('start-weather-temp');
        const startWeatherCondition = document.getElementById('start-weather-condition');
        
        if (startWeatherIcon && startWeatherTemp && startWeatherCondition) {
            startWeatherIcon.textContent = getWeatherIcon(startWeather.condition);
            startWeatherTemp.textContent = `${startWeather.temperature}°C`;
            startWeatherCondition.textContent = startWeather.condition;
        }
        
        // Update destination weather
        const endWeatherIcon = document.getElementById('end-weather-icon');
        const endWeatherTemp = document.getElementById('end-weather-temp');
        const endWeatherCondition = document.getElementById('end-weather-condition');
        
        if (endWeatherIcon && endWeatherTemp && endWeatherCondition) {
            endWeatherIcon.textContent = getWeatherIcon(endWeather.condition);
            endWeatherTemp.textContent = `${endWeather.temperature}°C`;
            endWeatherCondition.textContent = endWeather.condition;
        }
        
        // Update recommendation based on both weather conditions
        const weatherRecommendation = document.getElementById('weather-recommendation');
        if (weatherRecommendation) {
            weatherRecommendation.textContent = getDualWeatherRecommendation(startWeather, endWeather);
        }
        
        weatherSection.style.display = 'block';
        
        // Change background based on average weather conditions
        const avgCondition = getAverageWeatherCondition(startWeather, endWeather);
        changeWeatherBackground(avgCondition);
    }
}

// Extract city name from location string
function extractCityFromLocation(location) {
    // Simple extraction - take the first word or common city patterns
    const cityPatterns = [
        'toronto', 'waterloo', 'ottawa', 'montreal', 'vancouver', 'calgary', 'edmonton',
        'hamilton', 'london', 'kitchener', 'windsor', 'oshawa', 'barrie', 'kingston'
    ];
    
    const locationLower = location.toLowerCase();
    
    for (const city of cityPatterns) {
        if (locationLower.includes(city)) {
            return city.charAt(0).toUpperCase() + city.slice(1);
        }
    }
    
    // Default to Toronto if no city found
    return 'Toronto';
}

// Get recommendation based on both weather conditions
function getDualWeatherRecommendation(startWeather, endWeather) {
    const startCondition = startWeather.condition;
    const endCondition = endWeather.condition;
    const startTemp = startWeather.temperature;
    const endTemp = endWeather.temperature;
    
    // Both locations have good weather
    if ((startCondition === 'clear' || startCondition === 'sunny') && 
        (endCondition === 'clear' || endCondition === 'sunny')) {
        return 'Perfect weather at both locations! Great day for walking or cycling.';
    }
    
    // Both locations have bad weather
    if ((startCondition === 'rain' || startCondition === 'snow') && 
        (endCondition === 'rain' || endCondition === 'snow')) {
        return 'Challenging weather at both ends. Consider public transport or driving.';
    }
    
    // Mixed conditions
    if (startCondition === 'rain' || endCondition === 'rain') {
        return 'Rain expected at one or both locations. Plan accordingly with appropriate transport.';
    }
    
    if (startCondition === 'snow' || endCondition === 'snow') {
        return 'Snow conditions detected. Drive carefully or use public transport for safety.';
    }
    
    // Temperature considerations
    if (startTemp < 0 || endTemp < 0) {
        return 'Freezing temperatures expected. Bundle up and consider indoor transport options.';
    }
    
    if (startTemp > 25 || endTemp > 25) {
        return 'Hot weather ahead. Stay hydrated and consider air-conditioned transport.';
    }
    
    return 'Good conditions for travel. Choose your preferred transport mode.';
}

// Get average weather condition for background
function getAverageWeatherCondition(startWeather, endWeather) {
    const conditions = [startWeather.condition, endWeather.condition];
    
    // Priority: rain > snow > clouds > clear
    if (conditions.includes('rain') || conditions.includes('drizzle')) {
        return 'rain';
    }
    if (conditions.includes('snow')) {
        return 'snow';
    }
    if (conditions.includes('clouds') || conditions.includes('cloudy')) {
        return 'cloudy';
    }
    return 'clear';
}

function changeWeatherBackground(condition) {
    const body = document.body;
    
    // Remove existing weather classes
    body.classList.remove('weather-sunny', 'weather-cloudy', 'weather-rainy', 'weather-snowy', 'weather-clear');
    
    // Add new weather class
    switch(condition) {
        case 'clear':
        case 'sunny':
            body.classList.add('weather-sunny');
            break;
        case 'clouds':
        case 'cloudy':
            body.classList.add('weather-cloudy');
            break;
        case 'rain':
        case 'drizzle':
            body.classList.add('weather-rainy');
            break;
        case 'snow':
            body.classList.add('weather-snowy');
            break;
        default:
            body.classList.add('weather-clear');
    }
}

// Click-based summary function
function updateClickBasedSummary(selectedMode, selectedMetrics) {
    // Find the best alternative (usually driving for comparison)
    const drivingMetrics = allRouteMetrics.find(m => m.mode === 'driving');
    const bestEcoMetrics = allRouteMetrics.find(m => m.mode === 'walking') || allRouteMetrics.find(m => m.mode === 'cycling');
    
    if (!drivingMetrics || !bestEcoMetrics) return;
    
    // Calculate savings compared to driving
    const co2Saved = (drivingMetrics.carbon - selectedMetrics.carbon).toFixed(2);
    const caloriesBurned = selectedMetrics.calories;
    const moneySaved = (drivingMetrics.cost - selectedMetrics.cost).toFixed(2);
    
    // Update the summary display
    document.getElementById('co2Saved').textContent = `${co2Saved} kg`;
    document.getElementById('caloriesBurned').textContent = `${caloriesBurned} cal`;
    document.getElementById('moneySaved').textContent = `$${moneySaved}`;
    
    // Check for achievements
    checkAchievements({ co2Saved, caloriesBurned, moneySaved });
}

// Route selection functionality
let selectedRoute = null;
let allRouteMetrics = [];

// Route tracking and leaderboard data
let routeEntries = JSON.parse(localStorage.getItem('ecoRoutes') || '[]');

// Route visualization variables
let currentRouteData = null;

function selectRoute(mode, metrics) {
    // Remove previous selection
    document.querySelectorAll('.route-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selection to clicked card
    const selectedCard = document.querySelector(`[data-mode="${mode}"]`);
    selectedCard.classList.add('selected');
    
    selectedRoute = { mode, ...metrics };
    
    // Update summary based on selected route
    updateClickBasedSummary(mode, metrics);
    
    // Show detailed analysis
    showRouteAnalysis(mode, metrics);
    
    // Advanced AI Integration
    const route = { type: mode, ...metrics };
    const userHistory = userLearning.preferences;
    const weather = getCurrentWeather();
    const aiInsights = aiRouteAnalyzer.analyzeRoute(route, userHistory, weather);
    
    // Learn from user choice
    userLearning.learnFromChoice(route, { weather });
    
    // Check achievements
    const newAchievements = aiGamification.checkAchievements(route);
    
    // Show AI insights
    aiNotifications.showAIMessage(aiInsights.motivationalMessage, 'success');
    
    // Update AI chat
    addAIMessage(aiInsights.motivationalMessage);
    
    // Show achievements
    if (newAchievements.length > 0) {
        newAchievements.forEach(achievement => {
            aiNotifications.showAIMessage(`🎉 Achievement Unlocked: ${achievement.name}!`, 'success', 7000);
            addAIMessage(`🎉 Achievement Unlocked: ${achievement.name}! ${achievement.description}`);
        });
    }
    
    // Voice feedback (without emojis)
    if (voiceAI.synthesis) {
        const cleanMessage = removeEmojis(aiInsights.motivationalMessage);
        voiceAI.speak(cleanMessage);
    }
    
    console.log('AI integration completed for route:', mode, metrics);
    
    // Show route entry section
    showRouteEntrySection(mode, metrics);
    
    // Calculate eco-money balance
    calculateEcoMoneyBalance(metrics);
}

function showRouteAnalysis(mode, metrics) {
    const data = ROUTE_DATA[mode];
    
    // Create or update the analysis section
    let analysisSection = document.getElementById('route-analysis');
    if (!analysisSection) {
        analysisSection = document.createElement('div');
        analysisSection.id = 'route-analysis';
        analysisSection.className = 'route-analysis';
        document.querySelector('.results-section').appendChild(analysisSection);
    }
    
    analysisSection.innerHTML = `
        <h3>🎯 Selected Route Analysis: ${data.name}</h3>
        <div class="analysis-grid">
            <div class="analysis-card eco-score">
                <h4>🌱 Eco Score</h4>
                <div class="score-value">${calculateEcoScore(metrics)}/100</div>
                <p>Based on CO₂ emissions and environmental impact</p>
            </div>
            <div class="analysis-card money-score">
                <h4>💰 Money Score</h4>
                <div class="score-value">${calculateMoneyScore(metrics)}/100</div>
                <p>Based on cost efficiency and savings</p>
            </div>
            <div class="analysis-card balance-score">
                <h4>⚖️ Balance Score</h4>
                <div class="score-value">${calculateBalanceScore(metrics)}/100</div>
                <p>Optimal balance between eco-friendly and cost-effective</p>
            </div>
        </div>
        <div class="ai-recommendation">
            <h4>🤖 AI Recommendation</h4>
            <p>${getAIRouteRecommendation(mode, metrics)}</p>
            <div class="ai-insights">
                <h5>💡 AI Insights:</h5>
                <ul>
                    ${getAIInsights(mode, metrics).map(insight => `<li>${insight}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

function calculateEcoScore(metrics) {
    // Lower CO₂ = higher eco score (0-80 points)
    const maxCarbon = 25; // Maximum expected CO₂ for comparison
    const carbonScore = Math.max(0, 80 - (parseFloat(metrics.carbon) / maxCarbon) * 80);
    
    // Bonus for calories burned (active transport) (0-20 points)
    const calorieBonus = Math.min(20, parseFloat(metrics.calories) / 100);
    
    return Math.min(100, Math.round(carbonScore + calorieBonus));
}

function calculateMoneyScore(metrics) {
    // Lower cost = higher money score (0-80 points)
    const maxCost = 100; // Maximum expected cost for comparison
    const costScore = Math.max(0, 80 - (parseFloat(metrics.cost) / maxCost) * 80);
    
    // Bonus for free options (0-20 points)
    const freeBonus = parseFloat(metrics.cost) === 0 ? 20 : 0;
    
    return Math.min(100, Math.round(costScore + freeBonus));
}

function calculateBalanceScore(metrics) {
    const ecoScore = calculateEcoScore(metrics);
    const moneyScore = calculateMoneyScore(metrics);
    
    // Balance score considers both factors (weighted average)
    const balance = (ecoScore * 0.6) + (moneyScore * 0.4); // Slightly favor eco-friendly
    
    return Math.min(100, Math.round(balance));
}

function calculateEcoMoneyBalance(metrics) {
    const ecoScore = calculateEcoScore(metrics);
    const moneyScore = calculateMoneyScore(metrics);
    const balanceScore = calculateBalanceScore(metrics);
    
    console.log(`Eco Score: ${ecoScore}, Money Score: ${moneyScore}, Balance Score: ${balanceScore}`);
    
    return { ecoScore, moneyScore, balanceScore };
}

// AI-powered recommendation system
function getAIRouteRecommendation(mode, metrics) {
    const ecoScore = calculateEcoScore(metrics);
    const moneyScore = calculateMoneyScore(metrics);
    const balanceScore = calculateBalanceScore(metrics);
    
    // AI analysis based on multiple factors
    const distance = parseFloat(metrics.distance);
    const time = parseFloat(metrics.time);
    const carbon = parseFloat(metrics.carbon);
    const calories = parseFloat(metrics.calories);
    const cost = parseFloat(metrics.cost);
    
    if (balanceScore >= 85) {
        return `🤖 AI Analysis: Excellent choice! This route offers optimal balance between environmental impact and cost. Perfect for regular commuting.`;
    } else if (balanceScore >= 70) {
        return `🤖 AI Analysis: Good option! This route provides a reasonable balance. Consider this for occasional trips.`;
    } else if (ecoScore > moneyScore + 20) {
        return `🤖 AI Analysis: Eco-friendly choice! While it may cost more, you're making a significant positive environmental impact.`;
    } else if (moneyScore > ecoScore + 20) {
        return `🤖 AI Analysis: Budget-friendly option! This saves money but consider the environmental impact for frequent use.`;
    } else {
        return `🤖 AI Analysis: Consider alternatives. This route may not be optimal for regular use.`;
    }
}

function getAIInsights(mode, metrics) {
    const insights = [];
    const distance = parseFloat(metrics.distance);
    const time = parseFloat(metrics.time);
    const carbon = parseFloat(metrics.carbon);
    const calories = parseFloat(metrics.calories);
    const cost = parseFloat(metrics.cost);
    
    // Distance-based insights
    if (distance > 50) {
        insights.push(`Long distance (${distance}km) - consider breaking into segments`);
    } else if (distance < 2) {
        insights.push(`Short distance (${distance}km) - perfect for active transport`);
    }
    
    // Time-based insights
    if (time > 60) {
        insights.push(`Long duration (${time}min) - plan accordingly`);
    }
    
    // Carbon insights
    if (carbon === 0) {
        insights.push(`Zero emissions - excellent environmental choice`);
    } else if (carbon > 10) {
        insights.push(`High emissions (${carbon}kg CO₂) - consider alternatives`);
    }
    
    // Calorie insights
    if (calories > 200) {
        insights.push(`Great workout! You'll burn ${calories} calories`);
    }
    
    // Cost insights
    if (cost === 0) {
        insights.push(`Completely free - no financial impact`);
    } else if (cost > 20) {
        insights.push(`Higher cost ($${cost}) - budget consideration needed`);
    }
    
    // Mode-specific insights
    if (mode === 'walking') {
        insights.push(`Walking is the healthiest option with zero emissions`);
    } else if (mode === 'cycling') {
        insights.push(`Cycling offers great exercise with minimal environmental impact`);
    } else if (mode === 'driving') {
        insights.push(`Driving is fastest but has highest environmental cost`);
    } else if (mode === 'public') {
        insights.push(`Public transport reduces traffic congestion`);
    }
    
    return insights.slice(0, 4); // Limit to 4 insights
}

function getRouteRecommendation(mode, metrics) {
    const ecoScore = calculateEcoScore(metrics);
    const moneyScore = calculateMoneyScore(metrics);
    const balanceScore = calculateBalanceScore(metrics);
    
    if (balanceScore >= 80) {
        return `Excellent choice! This route offers great balance between environmental impact and cost. Perfect for regular commuting.`;
    } else if (balanceScore >= 60) {
        return `Good option! This route provides a reasonable balance. Consider this for occasional trips.`;
    } else if (ecoScore > moneyScore) {
        return `Eco-friendly choice! While it may cost more, you're making a positive environmental impact.`;
    } else if (moneyScore > ecoScore) {
        return `Budget-friendly option! This saves money but consider the environmental impact for frequent use.`;
    } else {
        return `Consider alternatives. This route may not be optimal for regular use.`;
    }
}
