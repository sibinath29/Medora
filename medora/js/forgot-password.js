document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('forgotPasswordForm').addEventListener('submit', (event) => {
        event.preventDefault();
        
        // Reset error messages and notification
        hideError('emailError');
        document.getElementById('notification').style.display = 'none';
        
        const email = document.getElementById('email').value;
        
        // Validate email
        if (!email || !isValidEmail(email)) {
            showError('emailError', !email ? 'Email is required' : 'Please enter a valid email');
            return;
        }
        
        // Create password reset request
        const resetToken = createPasswordResetRequest(email);
        
        if (resetToken) {
            // Show success message and redirect to email preview
            showNotification('Reset instructions have been sent to your email.', false);
            setTimeout(() => {
                window.location.href = `email-preview.html?token=${resetToken}&email=${encodeURIComponent(email)}`;
            }, 1500);
        } else {
            showNotification('Email not found. Please check your email address.', true);
        }
    });
}); 