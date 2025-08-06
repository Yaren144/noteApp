// App Configuration
const APP_CONFIG = {
    APP_NAME: "Notes App",
    VERSION: "1.0.0",
    PASSWORD: "123"
};

// App Data
const APP_DATA = {
    isLoggedIn: false,
    currentUser: null,
    notes: [],
    nextId: 1
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

async function logout() {
    if (window.notesAPI) {
        window.notesAPI.logout();
    }
    setLoginStatus(false);
    window.location.href = 'main_page.html';
}

// Note Functions - Updated to use API
async function addNote(noteData) {
    if (!noteData.content.trim()) return false;
    
    try {
        const newNote = await window.notesAPI.addNote(noteData.content);
        APP_DATA.notes.unshift(newNote);
        return true;
    } catch (error) {
        console.error('Error adding note:', error);
        return false;
    }
}

async function getAllNotes() {
    try {
        const notes = await window.notesAPI.getNotes();
        APP_DATA.notes = notes;
        return notes;
    } catch (error) {
        console.error('Error getting notes:', error);
        return [];
    }
}

async function deleteNote(noteId) {
    try {
        await window.notesAPI.deleteNote(noteId);
        APP_DATA.notes = APP_DATA.notes.filter(note => note.id !== parseInt(noteId));
        return true;
    } catch (error) {
        console.error('Error deleting note:', error);
        return false;
    }
}

// Login function
async function loginUser(password) {
    try {
        const result = await window.notesAPI.login(password);
        setLoginStatus(true, result.username);
        return true;
    } catch (error) {
        console.error('Login error:', error);
        return false;
    }
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
    loginUser: loginUser,
    setLoginStatus: setLoginStatus,
    isUserLoggedIn: isUserLoggedIn,
    logout: logout,
    
    // Note functions
    addNote: addNote,
    getAllNotes: getAllNotes,
    deleteNote: deleteNote
};