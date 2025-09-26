document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    try {
        const response = await notesAPI.register(username, email, password);
        
        if (response.success) {
            alert('Registration successful! You are now logged in.');
            window.location.href = 'notes.html'; // Redirect to notes page
        } else {
            alert('Registration failed: ' + (response.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert(error.message || 'An error occurred during registration.');
    }
});