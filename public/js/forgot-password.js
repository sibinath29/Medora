document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgotPasswordForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;

        // Basic validation
        if (!email) {
            showError('Email is required');
            return;
        }

        try {
            const response = await fetch('api/forgot-password.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (data.success) {
                showSuccess('Password reset link has been sent to your email');
                form.reset();
            } else {
                showError(data.message);
            }
        } catch (error) {
            showError('An error occurred. Please try again.');
            console.error('Error:', error);
        }
    });

    function showError(message) {
        const errorDiv = document.getElementById('error');
        const successDiv = document.getElementById('success');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        successDiv.style.display = 'none';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }

    function showSuccess(message) {
        const errorDiv = document.getElementById('error');
        const successDiv = document.getElementById('success');
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        errorDiv.style.display = 'none';
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 3000);
    }
}); 