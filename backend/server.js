const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const MySQLDatabase = require('./mysql-database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'secretkey';

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Initialize database
const db = new MySQLDatabase();
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
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.userId = decoded.userId;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
}


app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    console.log("Login attempt:", username, password);

    const user = await db.getUserByUsername(username);
    console.log("DB returned user:", user);

    if (!user) {
        return res.status(401).json({ error: 'Invalid username' });
    }

    const match = await bcrypt.compare(password, user.password);
    console.log("Password match:", match);

    if (!match) {
        return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ userId: user.id }, SECRET_KEY);
    res.json({ token });
});


app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check if user already exists
        const existingUser = await db.getUserByUsername(username);
        if (existingUser) {
            return res.status(409).json({ error: 'Username already taken' });
        }

        const existingEmail = await db.getUserByEmail(email);
        if (existingEmail) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await db.createUser(username, email, hashedPassword);
        console.log(hashedPassword);

        const token = jwt.sign({ userId: newUser.id }, SECRET_KEY);
        res.status(201).json({ 
            success: true,
            token,
            username: newUser.username
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Note Routes
app.post('/api/notes', requireAuth, async (req, res) => {
    const { content, title } = req.body;
    
    if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Note content is required' });
    }

    try {
        const newNote = await db.addNote(content, title || '', req.userId);
        res.status(201).json({ success: true, note: newNote });
    } catch (error) {
        console.error('Add note error:', error);
        res.status(500).json({ error: 'Failed to add note' });
    }
});

app.delete('/api/notes/:id', requireAuth, async (req, res) => {
    try {
        const deletedNote = await db.deleteNoteByUser(req.params.id, req.userId);
        if (!deletedNote) {
            return res.status(404).json({ error: 'Note not found or not owned by user' });
        }
        res.json({ success: true, message: 'Note deleted', note: deletedNote });
    } catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});
app.get('/api/notes', requireAuth, async (req, res) => {
    try {
        const notes = await db.getAllNotesByUserId(req.userId); // implement in mysql-database.js
        res.json(notes);
    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({ error: 'Failed to load notes' });
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