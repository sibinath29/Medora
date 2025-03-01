document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
        document.getElementById('welcomeMessage').textContent = `Welcome back, ${currentUser.name}!`;
        document.getElementById('welcomeMessage').style.display = 'block';
        document.getElementById('loginForm').style.display = 'none';
    }

    // Handle login form submission
    document.getElementById('loginForm').addEventListener('submit', (event) => {
        event.preventDefault();
        
        // Reset error messages and notification
        ['emailError', 'passwordError'].forEach(hideError);
        document.getElementById('notification').style.display = 'none';
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Validate form
        let isValid = true;
        
        if (!email || !isValidEmail(email)) {
            showError('emailError', !email ? 'Email is required' : 'Please enter a valid email');
            isValid = false;
        }
        
        if (!password || !isValidPassword(password)) {
            showError('passwordError', !password ? 'Password is required' : 'Password must be at least 6 characters');
            isValid = false;
        }
        
        if (isValid) {
            const user = getUserByEmail(email);
            
            if (user && user.password === password) {
                setCurrentUser(user);
                document.getElementById('welcomeMessage').textContent = `Welcome back, ${user.name}!`;
                document.getElementById('welcomeMessage').style.display = 'block';
                document.getElementById('loginForm').style.display = 'none';
            } else {
                showNotification(
                    user ? 'Incorrect password. Please try again.' : 'Account not found. Please sign up first.',
                    true
                );
            }
        }
    });
}); 