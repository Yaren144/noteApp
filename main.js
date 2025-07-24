// main.js - Global app configuration and shared data

// ========================================
// APP CONFIGURATION
// ========================================
const APP_CONFIG = {
    APP_NAME: "My Notes App",
    VERSION: "1.0.0",
    PASSWORD: "y123"
};

// ========================================
// GLOBAL APP DATA
// ========================================
const APP_DATA = {
    // User authentication
    password: APP_CONFIG.PASSWORD,
    isLoggedIn: false,
    loginTime: null,
    
    // Notes storage
    notes: [],
    nextNoteId: 1, // For unique note IDs
    
    // App settings
    settings: {
        dateFormat: 'en-US',
        maxNotes: 100
    }
};

// ========================================
// UTILITY FUNCTIONS (shared across pages)
// ========================================

// Generate unique ID for notes
function generateNoteId() {
    return APP_DATA.nextNoteId++;
}

// Format date for display
function formatDate(date) {
    return new Intl.DateTimeFormat(APP_DATA.settings.dateFormat, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Validate password
function validatePassword(inputPassword) {
    return inputPassword === APP_DATA.password;
}

// Set login status
function setLoginStatus(status) {
    APP_DATA.isLoggedIn = status;
    if (status) {
        APP_DATA.loginTime = new Date();
        console.log('User logged in at:', formatDate(APP_DATA.loginTime));
    } else {
        APP_DATA.loginTime = null;
        console.log('User logged out');
    }
}

// Check if user is logged in
function isUserLoggedIn() {
    return APP_DATA.isLoggedIn;
}

// Logout function (can be called from any page)
function logout() {
    setLoginStatus(false);
    // Redirect to main page
    window.location.href = 'index.html';
}

// ========================================
// NOTE MANAGEMENT FUNCTIONS
// ========================================

// Add new note
function addNote(content) {
    if (!content || content.trim() === '') {
        return { success: false, message: 'Note content cannot be empty' };
    }
    
    if (APP_DATA.notes.length >= APP_DATA.settings.maxNotes) {
        return { success: false, message: 'Maximum notes limit reached' };
    }
    
    const newNote = {
        id: generateNoteId(),
        content: content.trim(),
        dateCreated: new Date(),
        dateModified: new Date()
    };
    
    APP_DATA.notes.unshift(newNote); // Add to beginning (newest first)
    
    return { 
        success: true, 
        message: 'Note added successfully',
        note: newNote 
    };
}

// Get all notes
function getAllNotes() {
    return APP_DATA.notes;
}

// Delete note by ID
function deleteNote(noteId) {
    const noteIndex = APP_DATA.notes.findIndex(note => note.id === parseInt(noteId));
    
    if (noteIndex === -1) {
        return { success: false, message: 'Note not found' };
    }
    
    const deletedNote = APP_DATA.notes.splice(noteIndex, 1)[0];
    
    return { 
        success: true, 
        message: 'Note deleted successfully',
        deletedNote: deletedNote 
    };
}

// Get note by ID
function getNoteById(noteId) {
    return APP_DATA.notes.find(note => note.id === parseInt(noteId));
}

// ========================================
// PAGE NAVIGATION HELPERS
// ========================================

// Redirect to login if not authenticated
function requireAuth() {
    if (!isUserLoggedIn()) {
        console.log('Access denied: User not logged in');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Redirect to notes if already authenticated
function redirectIfLoggedIn() {
    if (isUserLoggedIn()) {
        console.log('User already logged in, redirecting to notes');
        window.location.href = 'notes.html';
        return true;
    }
    return false;
}

// ========================================
// MAKE DATA GLOBALLY AVAILABLE
// ========================================
window.notesApp = {
    // Data
    data: APP_DATA,
    config: APP_CONFIG,
    
    // Authentication functions
    validatePassword,
    setLoginStatus,
    isUserLoggedIn,
    logout,
    requireAuth,
    redirectIfLoggedIn,
    
    // Note functions
    addNote,
    getAllNotes,
    deleteNote,
    getNoteById,
    
    // Utility functions
    formatDate,
    generateNoteId
};

// ========================================
// MAIN PAGE INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log(`${APP_CONFIG.APP_NAME} v${APP_CONFIG.VERSION} initialized`);
    console.log('Current page:', window.location.pathname);
    
    // Add smooth animations to main page elements
    const welcomeTitle = document.querySelector('.welcome-title');
    const authButtons = document.querySelector('.auth-buttons');
    const photo = document.querySelector('.photos');
    
    // Animate elements on main page
    if (welcomeTitle) {
        welcomeTitle.style.opacity = '0';
        welcomeTitle.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            welcomeTitle.style.transition = 'all 0.6s ease';
            welcomeTitle.style.opacity = '1';
            welcomeTitle.style.transform = 'translateY(0)';
        }, 200);
    }
    
    if (authButtons) {
        authButtons.style.opacity = '0';
        authButtons.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            authButtons.style.transition = 'all 0.6s ease';
            authButtons.style.opacity = '1';
            authButtons.style.transform = 'translateY(0)';
        }, 400);
    }
    
    if (photo) {
        photo.style.opacity = '0';
        photo.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            photo.style.transition = 'all 0.8s ease';
            photo.style.opacity = '1';
            photo.style.transform = 'scale(1)';
        }, 100);
    }
    
    // Check if user is already logged in and redirect
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        redirectIfLoggedIn();
    }
    
    console.log('Main page animations initialized');
});