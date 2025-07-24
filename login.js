// login.js - Handle user login

document.addEventListener('DOMContentLoaded', function() {
    console.log('Login page loaded');
    
    // Check if user is already logged in
    if (window.notesApp && window.notesApp.isUserLoggedIn()) {
        console.log('User already logged in, redirecting...');
        window.location.href = 'notes.html';
        return;
    }
    
    // Get form elements (matching your HTML structure)
    const loginForm = document.querySelector('.login-form');
    const userNameInput = document.getElementById('userName');
    const passwordInput = document.getElementById('password');
    const enterLink = document.querySelector('a[href="add_note.html"]');
    
    // Handle form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent form from submitting normally
            
            const enteredUsername = userNameInput.value.trim();
            const enteredPassword = passwordInput.value.trim();
            
            // Check if fields are empty
            if (!enteredUsername) {
                alert('Please enter your username');
                return;
            }
            
            if (!enteredPassword) {
                alert('Please enter your password');
                return;
            }
            
            // For now, we'll accept any username and check only password
            // You can add username validation later if needed
            
            // Validate password using main.js function
            if (window.notesApp && window.notesApp.validatePassword(enteredPassword)) {
                console.log('Login successful!');
                
                // Set login status
                window.notesApp.setLoginStatus(true);
                
                // Clear form
                userNameInput.value = '';
                passwordInput.value = '';
                
                alert('Login successful! Redirecting to notes...');
                
                // Redirect to notes page
                window.location.href = 'add_note.html';
                
            } else {
                console.log('Login failed - wrong password');
                alert('Incorrect password. Please try again.');
                passwordInput.value = ''; // Clear the password field
                passwordInput.focus(); // Focus back to password input
            }
        });
    }
    
    // Handle "Enter" link click
    if (enterLink) {
        enterLink.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default link behavior
            
            // Trigger form submission instead
            loginForm.dispatchEvent(new Event('submit'));
        });
    }
    
    // Add Enter key support for both input fields
    if (userNameInput) {
        userNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loginForm.dispatchEvent(new Event('submit'));
            }
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loginForm.dispatchEvent(new Event('submit'));
            }
        });
    }
});