// Records and Leaderboard functionality
let routeEntries = JSON.parse(localStorage.getItem('ecoRoutes') || '[]');

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('currentEcoUser') || 'null');
    
    // Check authentication
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Update welcome message
    document.getElementById('welcome-user').textContent = `Welcome, ${currentUser.username}!`;
    
    // Refresh user stats from actual routes first
    refreshUserStatsFromRoutes();
    
    // Load user statistics
    loadUserStats();
    
    // Load personal records
    loadPersonalRecords();
    
    // Load leaderboard
    loadLeaderboard('weekly');
    
    // Add tab event listeners
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            // Update leaderboard
            loadLeaderboard(this.getAttribute('data-tab'));
        });
    });
});

function refreshUserStatsFromRoutes() {
    const currentUser = JSON.parse(localStorage.getItem('currentEcoUser') || 'null');
    if (!currentUser) return;
    
    // Calculate stats from actual routes
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
    
    // Update in localStorage
    const users = JSON.parse(localStorage.getItem('ecoRouteUsers') || '[]');
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('ecoRouteUsers', JSON.stringify(users));
        localStorage.setItem('currentEcoUser', JSON.stringify(currentUser));
    }
    
    console.log('Refreshed user stats:', {
        totalRoutes: currentUser.totalRoutes,
        totalCo2Saved: currentUser.totalCo2Saved,
        totalCaloriesBurned: currentUser.totalCaloriesBurned,
        totalMoneySaved: currentUser.totalMoneySaved
    });
}

function loadUserStats() {
    const currentUser = JSON.parse(localStorage.getItem('currentEcoUser') || 'null');
    if (!currentUser) {
        console.log('No current user found');
        return;
    }
    
    console.log('Loading user stats for:', currentUser.username);
    console.log('User stats:', {
        totalRoutes: currentUser.totalRoutes,
        totalCo2Saved: currentUser.totalCo2Saved,
        totalCaloriesBurned: currentUser.totalCaloriesBurned,
        totalMoneySaved: currentUser.totalMoneySaved
    });
    
    // Update summary stats
    document.getElementById('total-routes').textContent = currentUser.totalRoutes || 0;
    document.getElementById('total-co2').textContent = (currentUser.totalCo2Saved || 0).toFixed(1);
    document.getElementById('total-calories').textContent = currentUser.totalCaloriesBurned || 0;
    document.getElementById('total-money').textContent = `$${(currentUser.totalMoneySaved || 0).toFixed(2)}`;
}

function loadPersonalRecords() {
    const currentUser = JSON.parse(localStorage.getItem('currentEcoUser') || 'null');
    const personalRecordsList = document.getElementById('personal-records-list');
    
    console.log('Loading personal records...');
    console.log('Current user:', currentUser);
    console.log('Personal records list element:', personalRecordsList);
    
    if (!personalRecordsList || !currentUser) {
        console.log('Missing element or user:', { personalRecordsList, currentUser });
        return;
    }
    
    // Reload route entries to get latest data
    const allRouteEntries = JSON.parse(localStorage.getItem('ecoRoutes') || '[]');
    console.log('All route entries from localStorage:', allRouteEntries.length);
    
    // Get user's routes
    const userRoutes = allRouteEntries.filter(entry => entry.userName === currentUser.username);
    console.log('User routes found:', userRoutes.length);
    console.log('User routes:', userRoutes);
    
    if (userRoutes.length === 0) {
        personalRecordsList.innerHTML = `
            <div class="no-records">
                <p>No routes logged yet. Start your eco-friendly journey!</p>
            </div>
        `;
        return;
    }
    
    // Sort by date (newest first)
    userRoutes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    personalRecordsList.innerHTML = userRoutes.map(entry => {
        return `
            <div class="record-entry">
                <div class="record-header">
                    <div class="record-route">${entry.routeName}</div>
                    <div class="record-date">${entry.date}</div>
                </div>
                <div class="record-stats">
                    <div class="record-stat">
                        <div class="record-stat-value">${entry.distance} km</div>
                        <div class="record-stat-label">Distance</div>
                    </div>
                    <div class="record-stat">
                        <div class="record-stat-value">${entry.co2Saved} kg</div>
                        <div class="record-stat-label">CO₂ Saved</div>
                    </div>
                    <div class="record-stat">
                        <div class="record-stat-value">${entry.caloriesBurned} cal</div>
                        <div class="record-stat-label">Calories</div>
                    </div>
                </div>
                ${entry.note ? `<div class="record-note">"${entry.note}"</div>` : ''}
            </div>
        `;
    }).join('');
}

function loadLeaderboard(timeframe) {
    const leaderboardList = document.getElementById('leaderboard-list');
    if (!leaderboardList) return;
    
    // Reload route entries to get latest data
    const allRouteEntries = JSON.parse(localStorage.getItem('ecoRoutes') || '[]');
    console.log('Loading leaderboard with', allRouteEntries.length, 'total routes');
    
    // Filter entries by timeframe
    let filteredEntries = [...allRouteEntries];
    const now = new Date();
    
    if (timeframe === 'weekly') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredEntries = allRouteEntries.filter(entry => new Date(entry.timestamp) >= weekAgo);
    } else if (timeframe === 'monthly') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredEntries = allRouteEntries.filter(entry => new Date(entry.timestamp) >= monthAgo);
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
            <div class="no-records">
                <p>No routes logged in this timeframe. Be the first to log an eco-friendly route!</p>
            </div>
        `;
        return;
    }
    
    leaderboardList.innerHTML = sortedUsers.slice(0, 10).map((user, index) => {
        const rank = index + 1;
        const rankClass = rank <= 3 ? `rank-${rank}` : '';
        const latestRoute = user.routes[user.routes.length - 1];
        const isCurrentUser = user.userName === currentUser.username;
        
        return `
            <div class="leaderboard-entry ${rankClass} ${isCurrentUser ? 'current-user' : ''}">
                <div class="rank-number">${rank}</div>
                <div class="user-info">
                    <div class="user-name">${user.userName} ${isCurrentUser ? '(You)' : ''}</div>
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

// Add CSS for current user highlighting
const style = document.createElement('style');
style.textContent = `
    .leaderboard-entry.current-user {
        background: linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%) !important;
        border-left-color: #2196f3 !important;
        box-shadow: 0 5px 15px rgba(33, 150, 243, 0.2) !important;
    }
    
    .leaderboard-entry.current-user .user-name {
        color: #2196f3 !important;
        font-weight: 800 !important;
    }
`;
document.head.appendChild(style);
