document.addEventListener('DOMContentLoaded', () => {
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        showNotification('Invalid password reset link. Please request a new one.', true);
        document.getElementById('resetPasswordForm').style.display = 'none';
        return;
    }

    // Validate token
    const email = validateResetToken(token);
    if (!email) {
        showNotification('This password reset link has expired. Please request a new one.', true);
        document.getElementById('resetPasswordForm').style.display = 'none';
        return;
    }

    document.getElementById('resetPasswordForm').addEventListener('submit', (event) => {
        event.preventDefault();
        
        // Reset error messages
        ['passwordError', 'confirmPasswordError'].forEach(hideError);
        
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate passwords
        let isValid = true;
        
        if (!password || !isValidPassword(password)) {
            showError('passwordError', !password ? 'Password is required' : 'Password must be at least 6 characters');
            isValid = false;
        }

        if (password !== confirmPassword) {
            showError('confirmPasswordError', 'Passwords do not match');
            isValid = false;
        }
        
        if (isValid) {
            // Update password
            if (updateUserPassword(email, password)) {
                showNotification('Password updated successfully! Redirecting to login...', false);
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showNotification('An error occurred. Please try again.', true);
            }
        }
    });
}); 