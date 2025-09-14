// Example API Configuration File
// Copy this file to config.js and replace 'YOUR_API_KEY_HERE' with your actual API keys

const API_KEYS = {
    // OpenRouteService API - Completely FREE, no billing required
    // Get from: https://openrouteservice.org/dev/#/signup
    // Free tier: 2000 requests/day, no credit card required
    openRouteService: 'YOUR_OPENROUTE_API_KEY',
    
    // OpenWeatherMap API - Get from: https://openweathermap.org/api
    // Free tier: 1000 calls/day
    openWeather: 'YOUR_OPENWEATHER_API_KEY',
    
    // TomTom Traffic API - Get from: https://developer.tomtom.com/
    // Optional: For real-time traffic data
    tomtom: 'YOUR_TOMTOM_API_KEY'
};

// Instructions for getting API keys:

/*
1. OPENROUTE SERVICE API (FREE - NO BILLING!):
   - Go to https://openrouteservice.org/dev/#/signup
   - Sign up for FREE account (no credit card required!)
   - Get your API key from the dashboard
   - Free tier: 2000 requests per day
   - Replace 'YOUR_OPENROUTE_API_KEY' above with your key

2. OPENWEATHER API:
   - Go to https://openweathermap.org/api
   - Sign up for free account
   - Get your API key from the dashboard
   - Free tier allows 1000 calls per day

3. TOMTOM TRAFFIC API (Optional):
   - Go to https://developer.tomtom.com/
   - Sign up for free account
   - Get API key for Traffic Flow API
   - Free tier allows 2500 requests per day

SECURITY NOTE:
- Never commit API keys to public repositories
- Use environment variables in production
- Restrict API keys to specific domains/IPs
- Monitor usage to avoid unexpected charges
*/

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_KEYS;
}
