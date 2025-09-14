// AI Eco-Coach System
// Advanced AI personality and intelligence for EcoSmart Route Planner

// AI Personality Engine
const ecoCoach = {
    name: "EcoEve",
    personality: {
        enthusiasm: 0.8,
        knowledge: 0.9,
        humor: 0.6,
        encouragement: 0.9
    },
    
    // Dynamic response system
    responses: {
        greetings: [
            "Hi! I'm EcoEve, your AI sustainability coach! Ready to make today more eco-friendly?",
            "Welcome back! Let's find your perfect green route together!",
            "Hey there! I'm here to help you save the planet, one route at a time!",
            "Hello! Ready to discover your most sustainable route today?"
        ],
        routePraise: [
            "Amazing choice! You're saving the planet!",
            "Perfect! This route is eco-gold!",
            "Excellent! Your carbon footprint thanks you!",
            "Fantastic! You're becoming a cycling champion!",
            "Outstanding! Mother Earth is smiling!",
            "Brilliant! You're an eco-warrior!"
        ],
        challenges: [
            "Challenge: Can you bike 5km today?",
            "Try the scenic route - it's beautiful!",
            "Go car-free today - I believe in you!",
            "Let's beat your personal best! Ready?",
            "Discover a new eco-friendly route today!",
            "Try cycling in different weather conditions!"
        ],
        tips: [
            "Pro tip: Cycling burns calories AND saves CO₂!",
            "Fun fact: This route saves enough CO₂ to power a lightbulb for 2 hours!",
            "Did you know? Regular cycling can improve your health by 30%!",
            "Bonus: You're inspiring others to be more eco-conscious!",
            "Insight: Every eco-choice creates a ripple effect!",
            "Fact: Cycling reduces stress and boosts creativity!"
        ]
    },
    
    // Context-aware response generation
    getResponse: function(context, userData = {}) {
        const responses = this.responses[context] || this.responses.greetings;
        let response = responses[Math.floor(Math.random() * responses.length)];
        
        // Personalize based on user data
        if (userData.name) {
            response = response.replace('Hi!', `Hi ${userData.name}!`);
            response = response.replace('Hello!', `Hello ${userData.name}!`);
        }
        
        return response;
    },
    
    // Mood system
    getMood: function() {
        const moods = ['excited', 'encouraging', 'proud', 'motivated', 'inspiring'];
        return moods[Math.floor(Math.random() * moods.length)];
    }
};

// AI Route Intelligence with Learning
const aiRouteAnalyzer = {
    analyzeRoute: function(route, userHistory = {}, weather = {}, time = new Date()) {
        const ecoScore = this.calculateEcoScore(route);
        const personalFit = this.calculatePersonalFit(userHistory, route);
        const weatherAdvice = this.getWeatherAdvice(weather, route);
        const timeAdvice = this.getTimeAdvice(time, route);
        
        return {
            aiRecommendation: this.generateRecommendation(ecoScore, personalFit),
            motivationalMessage: ecoCoach.getResponse('routePraise'),
            ecoTip: ecoCoach.getResponse('tips'),
            challenge: ecoCoach.getResponse('challenges'),
            weatherAdvice: weatherAdvice,
            timeAdvice: timeAdvice,
            confidence: this.calculateConfidence(ecoScore, personalFit),
            alternatives: this.suggestAlternatives(route, userHistory)
        }
    },
    
    calculateEcoScore: function(route) {
        let score = 0;
        if (route.co2Saved > 0.5) score += 40;
        if (route.caloriesBurned > 100) score += 30;
        if (route.moneySaved > 1) score += 20;
        if (route.distance < 10) score += 10;
        
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'very good';
        if (score >= 40) return 'good';
        return 'fair';
    },
    
    calculatePersonalFit: function(userHistory, route) {
        if (!userHistory.preferences) return 'unknown';
        
        const routeType = route.type;
        const userPrefs = userHistory.preferences.routeTypes || {};
        const frequency = userPrefs[routeType] || 0;
        
        if (frequency > 5) return 'perfect';
        if (frequency > 2) return 'good';
        return 'new';
    },
    
    getWeatherAdvice: function(weather, route) {
        if (weather.condition === 'rain' && route.type === 'cycling') {
            return "It's raining! Consider public transport or walking today.";
        }
        if (weather.condition === 'sunny' && route.type === 'cycling') {
            return "Perfect cycling weather! This route will be beautiful today.";
        }
        if (weather.condition === 'cloudy' && route.type === 'cycling') {
            return "Great cycling weather! Not too hot, not too cold.";
        }
        return "Great choice for today's weather!";
    },
    
    getTimeAdvice: function(time, route) {
        const hour = time.getHours();
        if (hour >= 7 && hour <= 9) {
            return "Morning rush hour - this route avoids traffic!";
        }
        if (hour >= 17 && hour <= 19) {
            return "Evening commute - perfect time for a scenic route!";
        }
        if (hour >= 12 && hour <= 14) {
            return "Lunch break - great time for a refreshing bike ride!";
        }
        return "Great timing for this route!";
    },
    
    generateRecommendation: function(ecoScore, personalFit) {
        if (ecoScore === 'excellent' && personalFit === 'perfect') {
            return "PERFECT MATCH! This route is ideal for you!";
        }
        if (ecoScore === 'excellent') {
            return "EXCELLENT CHOICE! Highly recommended!";
        }
        if (personalFit === 'perfect') {
            return "PERFECT FIT! You'll love this route!";
        }
        if (ecoScore === 'very good') {
            return "VERY GOOD! Great for the environment!";
        }
        return "GOOD CHOICE! Great for the environment!";
    },
    
    calculateConfidence: function(ecoScore, personalFit) {
        let confidence = 0;
        if (ecoScore === 'excellent') confidence += 50;
        if (ecoScore === 'very good') confidence += 40;
        if (ecoScore === 'good') confidence += 30;
        
        if (personalFit === 'perfect') confidence += 30;
        if (personalFit === 'good') confidence += 20;
        
        return Math.min(confidence, 100);
    },
    
    suggestAlternatives: function(route, userHistory) {
        const alternatives = [];
        if (route.type === 'driving') {
            alternatives.push('Consider cycling for better health and environment!');
        }
        if (route.distance > 5) {
            alternatives.push('Try breaking this into shorter segments!');
        }
        if (route.type === 'cycling' && route.distance < 2) {
            alternatives.push('Perfect distance for a quick eco-boost!');
        }
        return alternatives;
    }
};

// Advanced User Learning with Patterns
const userLearning = {
    preferences: JSON.parse(localStorage.getItem('userPreferences') || '{}'),
    patterns: JSON.parse(localStorage.getItem('userPatterns') || '{}'),
    
    learnFromChoice: function(routeChoice, context = {}) {
        // Learn route preferences
        if (!this.preferences.routeTypes) this.preferences.routeTypes = {};
        if (!this.preferences.routeTypes[routeChoice.type]) {
            this.preferences.routeTypes[routeChoice.type] = 0;
        }
        this.preferences.routeTypes[routeChoice.type]++;
        
        // Learn time patterns
        const hour = new Date().getHours();
        if (!this.patterns.timePreferences) this.patterns.timePreferences = {};
        if (!this.patterns.timePreferences[hour]) {
            this.patterns.timePreferences[hour] = {};
        }
        if (!this.patterns.timePreferences[hour][routeChoice.type]) {
            this.patterns.timePreferences[hour][routeChoice.type] = 0;
        }
        this.patterns.timePreferences[hour][routeChoice.type]++;
        
        // Learn weather preferences
        if (context.weather) {
            if (!this.patterns.weatherPreferences) this.patterns.weatherPreferences = {};
            if (!this.patterns.weatherPreferences[context.weather.condition]) {
                this.patterns.weatherPreferences[context.weather.condition] = {};
            }
            if (!this.patterns.weatherPreferences[context.weather.condition][routeChoice.type]) {
                this.patterns.weatherPreferences[context.weather.condition][routeChoice.type] = 0;
            }
            this.patterns.weatherPreferences[context.weather.condition][routeChoice.type]++;
        }
        
        this.savePreferences();
    },
    
    getPersonalizedAdvice: function() {
        const favorite = Object.keys(this.preferences.routeTypes || {})
            .reduce((a, b) => this.preferences.routeTypes[a] > this.preferences.routeTypes[b] ? a : b, 'cycling');
        
        const insights = [];
        insights.push(`I notice you love ${favorite}! Great choice for the environment! 🌱`);
        
        if (this.preferences.routeTypes && Object.keys(this.preferences.routeTypes).length > 1) {
            insights.push("You're exploring different transport options - that's awesome! 🌟");
        }
        
        return insights.join(' ');
    },
    
    predictPreference: function(routeType, context = {}) {
        let score = 0;
        
        // Base preference
        if (this.preferences.routeTypes && this.preferences.routeTypes[routeType]) {
            score += this.preferences.routeTypes[routeType] * 10;
        }
        
        // Time-based prediction
        const hour = new Date().getHours();
        if (this.patterns.timePreferences && this.patterns.timePreferences[hour] && this.patterns.timePreferences[hour][routeType]) {
            score += this.patterns.timePreferences[hour][routeType] * 5;
        }
        
        // Weather-based prediction
        if (context.weather && this.patterns.weatherPreferences && this.patterns.weatherPreferences[context.weather.condition] && this.patterns.weatherPreferences[context.weather.condition][routeType]) {
            score += this.patterns.weatherPreferences[context.weather.condition][routeType] * 3;
        }
        
        return score;
    },
    
    savePreferences: function() {
        localStorage.setItem('userPreferences', JSON.stringify(this.preferences));
        localStorage.setItem('userPatterns', JSON.stringify(this.patterns));
    }
};

// Advanced Gamification System
const aiGamification = {
    achievements: [
        { id: 'first-eco-route', name: '🌱 First Eco-Route', description: 'Completed your first sustainable route', points: 10 },
        { id: 'cycling-streak', name: '🚴‍♀️ Cycling Streak', description: 'Cycled for 7 consecutive days', points: 50 },
        { id: 'carbon-saver', name: '💚 Carbon Saver', description: 'Saved 10kg of CO₂', points: 30 },
        { id: 'eco-champion', name: '🏆 Eco-Champion', description: 'Completed 50 eco-friendly routes', points: 100 },
        { id: 'weather-warrior', name: '🌧️ Weather Warrior', description: 'Cycled in different weather conditions', points: 25 },
        { id: 'time-optimizer', name: '⏰ Time Optimizer', description: 'Found the fastest eco-route', points: 20 }
    ],
    
    dailyChallenges: [
        "🌱 EcoEve's Challenge: Go car-free today!",
        "🚴‍♀️ Try a new scenic route this weekend",
        "💚 Beat your personal best cycling time",
        "🌸 Discover a route with beautiful nature",
        "⏰ Find the fastest eco-friendly route",
        "🌤️ Try cycling in different weather"
    ],
    
    userStats: JSON.parse(localStorage.getItem('userStats') || '{}'),
    
    getDailyChallenge: function() {
        const today = new Date().getDate();
        return this.dailyChallenges[today % this.dailyChallenges.length];
    },
    
    checkAchievements: function(routeChoice) {
        const newAchievements = [];
        
        // First eco route
        if (!this.userStats.achievements) this.userStats.achievements = [];
        if (this.userStats.achievements.length === 0 && routeChoice.co2Saved > 0) {
            newAchievements.push(this.achievements[0]);
        }
        
        // Carbon saver
        if (!this.userStats.totalCo2Saved) this.userStats.totalCo2Saved = 0;
        this.userStats.totalCo2Saved += routeChoice.co2Saved;
        if (this.userStats.totalCo2Saved >= 10 && !this.userStats.achievements.includes('carbon-saver')) {
            newAchievements.push(this.achievements[2]);
        }
        
        // Cycling streak
        if (routeChoice.type === 'cycling') {
            if (!this.userStats.cyclingStreak) this.userStats.cyclingStreak = 0;
            this.userStats.cyclingStreak++;
            if (this.userStats.cyclingStreak >= 7 && !this.userStats.achievements.includes('cycling-streak')) {
                newAchievements.push(this.achievements[1]);
            }
        } else {
            this.userStats.cyclingStreak = 0;
        }
        
        // Eco champion
        if (!this.userStats.totalRoutes) this.userStats.totalRoutes = 0;
        this.userStats.totalRoutes++;
        if (this.userStats.totalRoutes >= 50 && !this.userStats.achievements.includes('eco-champion')) {
            newAchievements.push(this.achievements[3]);
        }
        
        // Save stats
        this.saveStats();
        
        return newAchievements;
    },
    
    getProgress: function() {
        return {
            totalRoutes: this.userStats.totalRoutes || 0,
            totalCo2Saved: this.userStats.totalCo2Saved || 0,
            cyclingStreak: this.userStats.cyclingStreak || 0,
            achievements: this.userStats.achievements || [],
            points: this.userStats.points || 0
        };
    },
    
    saveStats: function() {
        localStorage.setItem('userStats', JSON.stringify(this.userStats));
    }
};

// Advanced Notification System
const aiNotifications = {
    showAIMessage: function(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `ai-notification ${type}`;
        notification.innerHTML = `
            <div class="eco-eve-avatar">🌱</div>
            <div class="message-content">
                <div class="message-text">${message}</div>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            </div>
            <button class="close-btn" onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
    },
    
    suggestOptimalRoute: function() {
        const weather = getCurrentWeather();
        const time = new Date();
        const hour = time.getHours();
        
        let suggestion = '';
        
        if (weather.condition === 'sunny' && hour >= 7 && hour <= 9) {
            suggestion = "Perfect morning for cycling! The scenic route will be beautiful!";
        } else if (weather.condition === 'rain') {
            suggestion = "It's raining! Consider public transport or walking today.";
        } else if (hour >= 17 && hour <= 19) {
            suggestion = "Evening rush hour - try the bike route to avoid traffic!";
        } else {
            suggestion = "Great time for any route! What's your preference today?";
        }
        
        this.showAIMessage(suggestion, 'success');
    },
    
    predictUserNeeds: function() {
        const userHistory = userLearning.preferences;
        const time = new Date();
        const hour = time.getHours();
        
        // Predict based on user patterns
        if (userHistory.routeTypes && userHistory.routeTypes.cycling > 3) {
            if (hour >= 7 && hour <= 9) {
                this.showAIMessage("Morning cycling time! Ready for your daily eco-adventure?", 'info');
            }
        }
        
        // Suggest based on weather
        const weather = getCurrentWeather();
        if (weather.condition === 'sunny') {
            this.showAIMessage("Beautiful day for cycling! Want to try a new route?", 'success');
        }
    }
};

// Voice Recognition and Synthesis
const voiceAI = {
    recognition: null,
    synthesis: window.speechSynthesis,
    isListening: false,
    
    init: function() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.handleVoiceInput(transcript);
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                aiNotifications.showAIMessage("Voice recognition error. Please try typing instead.", 'warning');
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
            };
        } else {
            console.log('Speech recognition not supported in this browser');
        }
    },
    
    startListening: function() {
        if (this.recognition && !this.isListening) {
            this.isListening = true;
            this.recognition.start();
            aiNotifications.showAIMessage("Listening... 🎤", 'info', 2000);
        }
    },
    
    stopListening: function() {
        if (this.recognition && this.isListening) {
            this.isListening = false;
            this.recognition.stop();
        }
    },
    
    handleVoiceInput: function(transcript) {
        const input = document.getElementById('ai-chat-input');
        if (input) {
            input.value = transcript;
            sendToAI();
        }
    },
    
    speak: function(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 0.8;
        this.synthesis.speak(utterance);
    }
};

// Initialize AI system when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Coach: Initializing...');
    
    // Initialize voice AI
    voiceAI.init();
    
    // Show welcome message after a delay to ensure DOM is ready
    setTimeout(() => {
        console.log('AI Coach: Showing welcome message...');
        const welcomeMessage = ecoCoach.getResponse('greeting');
        console.log('AI Coach: Welcome message:', welcomeMessage);
        
        // Try to add message to chat
        if (typeof addAIMessage === 'function') {
            addAIMessage(welcomeMessage);
            console.log('AI Coach: Message added to chat');
        } else {
            console.log('AI Coach: addAIMessage function not found');
        }
    }, 2000);
});
