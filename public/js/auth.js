// Check if user is authenticated
function isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
}

// Get current user data
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Logout user
async function logout() {
    try {
        const token = localStorage.getItem('token');
        if (token) {
            await fetch('api/logout.php', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login page
        window.location.href = 'index.html';
    }
}

// Add authentication check to protected pages
function checkAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
    }
}

// Add authentication header to fetch requests
function getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Export functions
window.auth = {
    isAuthenticated,
    getCurrentUser,
    logout,
    checkAuth,
    getAuthHeader
}; 