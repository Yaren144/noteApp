document.addEventListener('DOMContentLoaded', function() {
    // Check login status
    const token = localStorage.getItem('notesAppToken');
    

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Load notes from backend
    loadNotes();
    // Event listeners for buttons
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('notesAppToken');
        window.location.href = 'login.html';
    });

    // No need for addNoteBtn listener since it's handled via HTML link
});

async function loadNotes() {
    const token = localStorage.getItem('notesAppToken');
    try {
        const response = await fetch('/api/notes', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = 'login.html';
            }
            throw new Error('Failed to load notes');
        }
        
        const notes = await response.json();
        displayNotes(notes);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load notes. Please try again.');
    }
}

function displayNotes(notes) {
    const container = document.getElementById('notesContainer');
    const emptyState = document.getElementById('emptyState');
    
    // Clear existing notes but keep the empty state structure
    container.innerHTML = '';
    container.appendChild(emptyState);
    
    if (notes.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    notes.forEach(note => {
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';
        noteCard.innerHTML = `
            <div class="note-content">
                <h3>${note.title || 'Untitled Note'}</h3>
                <p>${note.content}</p>
            </div>
            <div class="note-meta">
                <span class="note-date">Created: ${new Date(note.createdAt).toLocaleString()}</span>
                <button class="delete-btn" data-id="${note.id}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Delete
                </button>
            </div>
        `;
        container.insertBefore(noteCard, emptyState);
    });

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            if (confirm('Are you sure you want to delete this note?')) {
                await deleteNote(this.dataset.id);
            }
        });
    });
}

async function deleteNote(noteId) {
    const token = localStorage.getItem('notesAppToken');
    try {
        const response = await fetch(`/api/notes/${noteId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to delete note');
        
        loadNotes(); // Refresh the list
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete note. Please try again.');
    }
}