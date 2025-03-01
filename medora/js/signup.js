document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('signupForm').addEventListener('submit', (event) => {
        event.preventDefault();
        
        // Reset error messages
        ['nameError', 'emailError', 'passwordError', 'confirmPasswordError'].forEach(hideError);
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate form
        let isValid = true;
        
        if (!isValidName(name)) {
            showError('nameError', 'Name must be at least 2 characters long');
            isValid = false;
        }

        if (!email || !isValidEmail(email)) {
            showError('emailError', !email ? 'Email is required' : 'Please enter a valid email');
            isValid = false;
        }
        
        if (!password || !isValidPassword(password)) {
            showError('passwordError', !password ? 'Password is required' : 'Password must be at least 6 characters');
            isValid = false;
        }

        if (password !== confirmPassword) {
            showError('confirmPasswordError', 'Passwords do not match');
            isValid = false;
        }
        
        if (isValid) {
            const existingUser = getUserByEmail(email);
            
            if (existingUser) {
                showError('emailError', 'This email is already registered');
                return;
            }
            
            // Create new user
            createUser({ name, email, password });
            
            // Show success message and redirect
            showNotification('Account created successfully! Redirecting to login page...', false);
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    });
}); 