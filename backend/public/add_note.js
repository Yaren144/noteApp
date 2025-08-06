document.addEventListener('DOMContentLoaded', function() {
    // Check login status
    const token = localStorage.getItem('notesToken');
    if (!token) {
        window.location.href = 'login_page.html';
        return;
    }

    const form = document.getElementById('noteForm');
    const titleInput = document.getElementById('noteTitle');
    const contentInput = document.getElementById('noteContent');
    const clearBtn = document.getElementById('clearBtn');

    // Clear form
    clearBtn.addEventListener('click', function() {
        titleInput.value = '';
        contentInput.value = '';
    });

    // Submit form
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const noteData = {
            title: titleInput.value.trim(),
            content: contentInput.value.trim()
        };

        if (!noteData.content) {
            alert('Note content cannot be empty!');
            return;
        }

        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(noteData)
            });
            
            if (!response.ok) throw new Error('Failed to add note');
            
            alert('Note added successfully!');
            window.location.href = 'notes.html';
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding note! Please try again.');
        }
    });
});