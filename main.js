// App Configuration
const APP_CONFIG = {
    APP_NAME: "Notes App",
    VERSION: "1.0.0",
    PASSWORD: "123" // Default password
};

// App Data
const APP_DATA = {
    isLoggedIn: false,
    currentUser: null, // Track logged-in user
    notes: JSON.parse(localStorage.getItem('notesApp_notes')) || [],
    nextId: JSON.parse(localStorage.getItem('notesApp_nextId')) || 1

};

// Authentication Functions
function setLoginStatus(status, username = null) {
    APP_DATA.isLoggedIn = status;
    APP_DATA.currentUser = username;
    localStorage.setItem('notesApp_isLoggedIn', status);
    localStorage.setItem('notesApp_currentUser', username || '');
}

function isUserLoggedIn() {
    return localStorage.getItem('notesApp_isLoggedIn') === 'true';
}

function getCurrentUser() {
    return localStorage.getItem('notesApp_currentUser') || null;
}

function logout() {
    setLoginStatus(false);
    window.location.href = 'main_page.html';
}

function saveNotes() {
    localStorage.setItem('notesApp_notes', JSON.stringify(APP_DATA.notes));
    localStorage.setItem('notesApp_nextId', APP_DATA.nextNoteId);
}

// Note Functions
function addNote(noteData) {
    if (!noteData.content.trim()) return false;
    
    const newNote = {
        id: APP_DATA.nextNoteId++,
        content: noteData.content.trim(),
        date: new Date()  
    };
    
    APP_DATA.notes.unshift(newNote);
    saveNotes(); 
    return true;
}

function getAllNotes() {
    return APP_DATA.notes;
}

function deleteNote(noteId) {
    APP_DATA.notes = APP_DATA.notes.filter(note => note.id !== parseInt(noteId));
    saveNotes();
}

function saveNotesToStorage() {
    localStorage.setItem('notesApp_notes', JSON.stringify(APP_DATA.notes));
    localStorage.setItem('notesApp_nextId', APP_DATA.nextId);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    APP_DATA.isLoggedIn = isUserLoggedIn();
    APP_DATA.currentUser = getCurrentUser();
    
    // Setup logout button if exists
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});

// Global Access
window.notesApp = {
    // Data
    config: APP_CONFIG,
    data: APP_DATA,
    
    // Auth functions
    validatePassword: function(input) {
        return input === this.config.PASSWORD;
    },
    setLoginStatus: setLoginStatus,
    isUserLoggedIn: isUserLoggedIn,
    logout: logout,
    
    // Note functions
    addNote: addNote,
    getAllNotes: getAllNotes,
    deleteNote: deleteNote
};

// Initialize immediately
(function init() {
    const storedLogin = localStorage.getItem('notesApp_isLoggedIn');
    if (storedLogin === 'true') {
        APP_DATA.isLoggedIn = true;
        APP_DATA.notes = JSON.parse(localStorage.getItem('notesApp_notes')) || [];
        APP_DATA.nextNoteId = parseInt(localStorage.getItem('notesApp_nextId')) || 1;
    }
})();