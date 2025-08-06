const express = require('express');
const cors = require('cors');
const path = require('path');
const MySQLDatabase = require('./mysql-database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Initialize database
const db = new MySQLDatabase();
const APP_PASSWORD = process.env.APP_PASSWORD || "123";

// Connect to database
let dbConnected = false;
async function initializeDatabase() {
    try {
        await db.connect();
        dbConnected = true;
        console.log('Database connected!');
    } catch (error) {
        console.error('Database connection failed:', error.message);
    }
}
initializeDatabase();

// Authentication middleware
function requireAuth(req, res, next) {
    if (!dbConnected) {
        return res.status(503).json({ error: 'Database not available' });
    }
    
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${APP_PASSWORD}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

// Routes
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    
    if (password === APP_PASSWORD) {
        res.json({ 
            success: true, 
            token: APP_PASSWORD
        });
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});

// Note routes (same as before)
app.get('/api/notes', requireAuth, async (req, res) => {
    try {
        const notes = await db.getAllNotes();
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve notes' });
    }
});

app.post('/api/notes', requireAuth, async (req, res) => {
    const { content, title } = req.body;
    
    if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Note content is required' });
    }
    
    try {
        const newNote = await db.addNote(content, title);
        res.status(201).json(newNote);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add note' });
    }
});

app.delete('/api/notes/:id', requireAuth, async (req, res) => {
    const noteId = req.params.id;
    
    try {
        const deletedNote = await db.deleteNote(noteId);
        
        if (!deletedNote) {
            return res.status(404).json({ error: 'Note not found' });
        }
        
        res.json({ message: 'Note deleted successfully', note: deletedNote });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});