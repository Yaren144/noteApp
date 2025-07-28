document.addEventListener('DOMContentLoaded', function() {
    if (!window.notesApp || !window.notesApp.data.isLoggedIn) {
        window.location.href = 'login_page.html';
        return;
    }

    const form = document.getElementById('noteForm');
    const titleInput = document.getElementById('noteTitle');
    const contentInput = document.getElementById('noteContent');
    const clearBtn = document.getElementById('clearBtn');

    
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            titleInput.value = '';
            contentInput.value = '';
        });
    }

    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const noteData = {
            title: titleInput.value.trim(),
            content: contentInput.value.trim()
        };

        if (!noteData.content) {
            alert('Note content cannot be empty!');
            return;
        }

        
        if (window.notesApp.addNote(noteData)) {
            alert('Note added successfully!');
            window.location.href = 'notes.html';
        } else {
            alert('Failed to add note!');
        }
    });
});