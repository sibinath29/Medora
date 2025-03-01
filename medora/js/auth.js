// Utility functions for form validation
const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPassword = (password) => {
    return password && password.length >= 6;
};

const isValidName = (name) => {
    return name && name.trim().length >= 2;
};

// User management functions
const getUserByEmail = (email) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find(user => user.email === email);
};

const createUser = (userData) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));
};

const setCurrentUser = (user) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
};

const getCurrentUser = () => {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
};

// Form handling utilities
const showError = (elementId, message) => {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
};

const hideError = (elementId) => {
    document.getElementById(elementId).style.display = 'none';
};

const showNotification = (message, isError = true) => {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    notification.style.backgroundColor = isError ? '#fee2e2' : '#dcfce7';
    notification.style.borderColor = isError ? '#dc2626' : '#16a34a';
    notification.style.color = isError ? '#dc2626' : '#16a34a';
};

// Password reset functions
const generateResetToken = () => {
    return Math.random().toString(36).substr(2, 15);
};

const createPasswordResetRequest = (email) => {
    const user = getUserByEmail(email);
    if (!user) {
        return false;
    }

    const resetToken = generateResetToken();
    const resetExpiry = Date.now() + 3600000; // 1 hour expiry

    // Store reset information
    const resetRequests = JSON.parse(localStorage.getItem('resetRequests') || '[]');
    resetRequests.push({
        email,
        token: resetToken,
        expiry: resetExpiry
    });
    localStorage.setItem('resetRequests', JSON.stringify(resetRequests));

    return resetToken;
};

const validateResetToken = (token) => {
    const resetRequests = JSON.parse(localStorage.getItem('resetRequests') || '[]');
    const request = resetRequests.find(req => req.token === token);

    if (!request) {
        return false;
    }

    if (Date.now() > request.expiry) {
        // Remove expired token
        const updatedRequests = resetRequests.filter(req => req.token !== token);
        localStorage.setItem('resetRequests', JSON.stringify(updatedRequests));
        return false;
    }

    return request.email;
};

const updateUserPassword = (email, newPassword) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(user => user.email === email);
    
    if (userIndex === -1) {
        return false;
    }

    users[userIndex].password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));

    // Clear any reset requests for this email
    const resetRequests = JSON.parse(localStorage.getItem('resetRequests') || '[]');
    const updatedRequests = resetRequests.filter(req => req.email !== email);
    localStorage.setItem('resetRequests', JSON.stringify(updatedRequests));

    return true;
}; 