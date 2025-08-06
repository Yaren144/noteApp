const mysql = require('mysql2/promise');
require('dotenv').config();

class MySQLDatabase {
    constructor() {
        this.connection = null;
        this.config = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '', // You'll set this
            database: process.env.DB_NAME || 'notes_app'
        };
    }

    // Connect to MySQL
    async connect() {
        try {
            // First connect without database to create it if needed
            const tempConnection = await mysql.createConnection({
                host: this.config.host,
                user: this.config.user,
                password: this.config.password
            });

            // Create database if it doesn't exist
            await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS ${this.config.database}`);
            await tempConnection.end();

            // Now connect to the database
            this.connection = await mysql.createConnection(this.config);
            
            console.log('🐬 Connected to MySQL database');
            await this.createTables();
            
        } catch (error) {
            console.error('❌ MySQL connection failed:', error.message);
            throw error;
        }
    }

    // Create tables if they don't exist
    async createTables() {
        const createNotesTable = `
            CREATE TABLE IF NOT EXISTS notes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) DEFAULT '',
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;

        try {
            await this.connection.execute(createNotesTable);
            console.log('📋 Notes table ready');
        } catch (error) {
            console.error('❌ Error creating tables:', error.message);
            throw error;
        }
    }

    // Get all notes
    async getAllNotes() {
        try {
            console.log('🔄 Fetching all notes from database...');
            
            const [rows] = await this.connection.execute(
                'SELECT id, title, content, created_at, updated_at FROM notes ORDER BY created_at DESC'
            );
            
            console.log(`📊 Raw database result: ${rows.length} rows found`);
            console.log('📄 Sample row:', rows[0]);

            // Convert MySQL datetime to ISO string
            const notes = rows.map(note => ({
                ...note,
                createdAt: note.created_at.toISOString(),
                updatedAt: note.updated_at.toISOString()
            }));

            console.log(`📖 Retrieved ${notes.length} notes from database`);
            return notes;
        } catch (error) {
            console.error('❌ Error getting notes:', error.message);
            throw error;
        }
    }

    // Add a new note
    async addNote(content, title = '') {
        try {
            console.log('🔄 Attempting to add note:', { title, content: content.substring(0, 30) + '...' });
            
            const [result] = await this.connection.execute(
                'INSERT INTO notes (title, content) VALUES (?, ?)',
                [title, content.trim()]
            );

            console.log('✅ Insert successful, ID:', result.insertId);

            // Get the newly created note
            const [rows] = await this.connection.execute(
                'SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ?',
                [result.insertId]
            );

            console.log('📄 Retrieved note:', rows[0]);

            const newNote = {
                ...rows[0],
                createdAt: rows[0].created_at.toISOString(),
                updatedAt: rows[0].updated_at.toISOString()
            };

            console.log(`➕ Added note #${newNote.id}: "${content.substring(0, 30)}..."`);
            return newNote;
        } catch (error) {
            console.error('❌ Error adding note:', error.message);
            console.error('❌ Full error:', error);
            throw error;
        }
    }

    // Delete a note
    async deleteNote(noteId) {
        try {
            // First get the note to return it
            const [rows] = await this.connection.execute(
                'SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ?',
                [parseInt(noteId)]
            );

            if (rows.length === 0) {
                return null;
            }

            // Delete the note
            await this.connection.execute('DELETE FROM notes WHERE id = ?', [parseInt(noteId)]);

            const deletedNote = {
                ...rows[0],
                createdAt: rows[0].created_at.toISOString(),
                updatedAt: rows[0].updated_at.toISOString()
            };

            console.log(`🗑️ Deleted note #${noteId}`);
            return deletedNote;
        } catch (error) {
            console.error('❌ Error deleting note:', error.message);
            throw error;
        }
    }

    // Update a note
    async updateNote(noteId, content, title = '') {
        try {
            const [result] = await this.connection.execute(
                'UPDATE notes SET title = ?, content = ? WHERE id = ?',
                [title, content.trim(), parseInt(noteId)]
            );

            if (result.affectedRows === 0) {
                return null;
            }

            // Get the updated note
            const [rows] = await this.connection.execute(
                'SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ?',
                [parseInt(noteId)]
            );

            const updatedNote = {
                ...rows[0],
                createdAt: rows[0].created_at.toISOString(),
                updatedAt: rows[0].updated_at.toISOString()
            };

            console.log(`✏️ Updated note #${noteId}`);
            return updatedNote;
        } catch (error) {
            console.error('❌ Error updating note:', error.message);
            throw error;
        }
    }

    // Get database stats
    async getStats() {
        try {
            const [countRows] = await this.connection.execute('SELECT COUNT(*) as total FROM notes');
            const [oldestRows] = await this.connection.execute('SELECT MIN(created_at) as oldest FROM notes');
            const [newestRows] = await this.connection.execute('SELECT MAX(created_at) as newest FROM notes');

            return {
                totalNotes: countRows[0].total,
                oldestNote: oldestRows[0].oldest,
                newestNote: newestRows[0].newest
            };
        } catch (error) {
            console.error('❌ Error getting stats:', error.message);
            throw error;
        }
    }

    // Close connection
    async close() {
        if (this.connection) {
            await this.connection.end();
            console.log('🔌 MySQL connection closed');
        }
    }
}

module.exports = MySQLDatabase;