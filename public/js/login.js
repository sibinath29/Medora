document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = 'home.html';
        return;
    }

    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const notification = document.getElementById('notification');

    // Get the current server URL
    const serverUrl = window.location.origin;

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.classList.toggle('fa-eye');
        togglePassword.classList.toggle('fa-eye-slash');
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset error messages
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Basic validation
        if (!email || !password) {
            showError('All fields are required');
            return;
        }

        try {
            showMessage('Logging in...', 'info');
            const response = await fetch(`${serverUrl}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (data.success) {
                // Store token and user data
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                showSuccess('Login successful! Redirecting...');
                // Redirect immediately to home page
                window.location.href = 'home.html';
            } else {
                showError(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Unable to connect to server. Please try again.');
        }
    });

    // Notification function
    function showError(message) {
        const errorDiv = document.getElementById('error');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        errorDiv.style.backgroundColor = '#ffebee';
        errorDiv.style.color = '#c62828';
        errorDiv.style.border = '1px solid #ffcdd2';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }

    function showSuccess(message) {
        const errorDiv = document.getElementById('error');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        errorDiv.style.backgroundColor = '#e8f5e9';
        errorDiv.style.color = '#2e7d32';
        errorDiv.style.border = '1px solid #c8e6c9';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }

    function showMessage(message, type) {
        const errorDiv = document.getElementById('error');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        if (type === 'info') {
            errorDiv.style.backgroundColor = '#e3f2fd';
            errorDiv.style.color = '#1565c0';
            errorDiv.style.border = '1px solid #bbdefb';
        }
    }
}); 