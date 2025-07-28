// notes.js - Handle displaying notes on the notes page

function displayNotes() {
    const notesContainer = document.getElementById('notesContainer');
    const emptyState = document.getElementById('emptyState');
    
    if (!notesContainer) return;

    // Get all notes
    const notes = window.notesApp.getAllNotes();
    
    // Clear container
    notesContainer.innerHTML = '';
    
    if (notes.length === 0) {
        // Show empty state
        notesContainer.innerHTML = `
            <div class="empty-state" id="emptyState">
                <p>No notes yet. Click "Add New Note" to create your first note!</p>
            </div>
        `;
        return;
    }
    
    // Display notes
    notes.forEach(note => {
        const noteCard = createNoteCard(note);
        notesContainer.appendChild(noteCard);
    });
}

function createNoteCard(note) {
    const noteCard = document.createElement('div');
    noteCard.className = 'note-card';
    noteCard.setAttribute('data-note-id', note.id);
    
    // Format date
    const date = new Date(note.date);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    noteCard.innerHTML = `
        <div class="note-content">
            <p>${escapeHtml(note.content)}</p>
        </div>
        <div class="note-meta">
            <span class="note-date">${formattedDate}</span>
            <button class="delete-btn" onclick="handleDeleteNote(${note.id})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Delete
            </button>
        </div>
    `;
    
    return noteCard;
}

function handleDeleteNote(noteId) {
    if (confirm('Are you sure you want to delete this note?')) {
        window.notesApp.deleteNote(noteId);
        displayNotes(); // Refresh the display
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!window.notesApp.isUserLoggedIn()) {
        window.location.href = 'main_page.html';
        return;
    }
    
    // Display notes
    displayNotes();
    
    // Add refresh functionality if needed
    window.refreshNotes = displayNotes;
});