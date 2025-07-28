
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('userName');
    const passwordInput = document.getElementById('password');

    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            
            // Validate inputs
            if (!username) {
                alert('Please enter your username');
                return;
            }
            
            if (!password) {
                alert('Please enter your password');
                return;
            }
            
            
            if (window.notesApp && window.notesApp.validatePassword(password)) {
                window.notesApp.setLoginStatus(true, username);
                alert(`Welcome ${username}! Redirecting...`);
                window.location.href = 'notes.html';
            } else {
                alert('Incorrect password');
                passwordInput.value = '';
                passwordInput.focus();
            }
        });
    }

    
    [usernameInput, passwordInput].forEach(input => {
        input?.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loginForm.dispatchEvent(new Event('submit'));
            }
        });
    });
});