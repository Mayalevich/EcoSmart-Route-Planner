// User Database (in a real app, this would be a backend database)
let users = JSON.parse(localStorage.getItem('ecoRouteUsers') || '[]');
let currentUser = JSON.parse(localStorage.getItem('currentEcoUser') || 'null');

// Authentication functions
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    const successDiv = document.getElementById('success-message');
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    successDiv.style.display = 'none';
}

function showSuccess(message) {
    const errorDiv = document.getElementById('error-message');
    const successDiv = document.getElementById('success-message');
    
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    errorDiv.style.display = 'none';
}

function hideMessages() {
    document.getElementById('error-message').style.display = 'none';
    document.getElementById('success-message').style.display = 'none';
}

function validateUsername(username) {
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

function validatePassword(password) {
    return password.length >= 6;
}

function validateEmail(email) {
    if (!email) return true; // Email is optional
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hashPassword(password) {
    // Simple hash function (in production, use proper hashing)
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
}

function createUser(username, password, email = '') {
    const user = {
        id: Date.now(),
        username: username,
        passwordHash: hashPassword(password),
        email: email,
        createdAt: new Date().toISOString(),
        totalRoutes: 0,
        totalCo2Saved: 0,
        totalCaloriesBurned: 0,
        totalMoneySaved: 0,
        achievements: []
    };
    
    users.push(user);
    localStorage.setItem('ecoRouteUsers', JSON.stringify(users));
    return user;
}

function findUser(username) {
    return users.find(user => user.username === username);
}

function authenticateUser(username, password) {
    const user = findUser(username);
    if (!user) return null;
    
    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) return null;
    
    return user;
}

function login(username, password) {
    hideMessages();
    
    if (!validateUsername(username)) {
        showError('Username must be 3-20 characters and contain only letters, numbers, and underscores.');
        return false;
    }
    
    if (!validatePassword(password)) {
        showError('Password must be at least 6 characters long.');
        return false;
    }
    
    const user = authenticateUser(username, password);
    if (!user) {
        showError('Invalid username or password.');
        return false;
    }
    
    // Set current user
    currentUser = user;
    localStorage.setItem('currentEcoUser', JSON.stringify(currentUser));
    
    showSuccess('Login successful! Redirecting...');
    
    // Redirect to main page after a short delay
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
    
    return true;
}

function signup(username, password, confirmPassword, email = '') {
    hideMessages();
    
    if (!validateUsername(username)) {
        showError('Username must be 3-20 characters and contain only letters, numbers, and underscores.');
        return false;
    }
    
    if (!validatePassword(password)) {
        showError('Password must be at least 6 characters long.');
        return false;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match.');
        return false;
    }
    
    if (!validateEmail(email)) {
        showError('Please enter a valid email address.');
        return false;
    }
    
    if (findUser(username)) {
        showError('Username already exists. Please choose a different username.');
        return false;
    }
    
    const user = createUser(username, password, email);
    currentUser = user;
    localStorage.setItem('currentEcoUser', JSON.stringify(currentUser));
    
    showSuccess('Account created successfully! Redirecting...');
    
    // Redirect to main page after a short delay
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
    
    return true;
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentEcoUser');
    window.location.href = 'login.html';
}

// Check if user is logged in
function checkAuth() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Update user statistics
function updateUserStats(routeEntry) {
    if (!currentUser) return;
    
    const user = findUser(currentUser.username);
    if (!user) return;
    
    user.totalRoutes += 1;
    user.totalCo2Saved += routeEntry.co2Saved;
    user.totalCaloriesBurned += routeEntry.caloriesBurned;
    user.totalMoneySaved += routeEntry.moneySaved;
    
    // Update in localStorage
    localStorage.setItem('ecoRouteUsers', JSON.stringify(users));
    localStorage.setItem('currentEcoUser', JSON.stringify(user));
    currentUser = user;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    
    // Toggle between login and signup forms
    if (showSignupLink) {
        showSignupLink.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('signup-form').style.display = 'block';
            document.getElementById('signup-divider').style.display = 'block';
            document.getElementById('signup-login-link').style.display = 'block';
            showSignupLink.parentElement.style.display = 'none';
            hideMessages();
        });
    }
    
    if (showLoginLink) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('login-form').style.display = 'block';
            document.getElementById('signup-form').style.display = 'none';
            document.getElementById('signup-divider').style.display = 'none';
            document.getElementById('signup-login-link').style.display = 'none';
            showSignupLink.parentElement.style.display = 'block';
            hideMessages();
        });
    }
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            if (loginBtn) {
                loginBtn.disabled = true;
                const loginText = document.getElementById('login-text');
                const loginLoading = document.getElementById('login-loading');
                if (loginText) loginText.style.display = 'none';
                if (loginLoading) loginLoading.style.display = 'inline';
            }
            
            setTimeout(() => {
                login(username, password);
                if (loginBtn) {
                    loginBtn.disabled = false;
                    const loginText = document.getElementById('login-text');
                    const loginLoading = document.getElementById('login-loading');
                    if (loginText) loginText.style.display = 'inline';
                    if (loginLoading) loginLoading.style.display = 'none';
                }
            }, 1000);
        });
    }
    
    // Signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('signup-username').value.trim();
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const email = document.getElementById('email').value.trim();
            
            if (signupBtn) {
                signupBtn.disabled = true;
                const signupText = document.getElementById('signup-text');
                const signupLoading = document.getElementById('signup-loading');
                if (signupText) signupText.style.display = 'none';
                if (signupLoading) signupLoading.style.display = 'inline';
            }
            
            setTimeout(() => {
                signup(username, password, confirmPassword, email);
                if (signupBtn) {
                    signupBtn.disabled = false;
                    const signupText = document.getElementById('signup-text');
                    const signupLoading = document.getElementById('signup-loading');
                    if (signupText) signupText.style.display = 'inline';
                    if (signupLoading) signupLoading.style.display = 'none';
                }
            }, 1000);
        });
    }
});
