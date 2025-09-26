const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

class MySQLDatabase {
    constructor() {
        this.connection = null;
        this.config = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'notes_app'
        };
    }

    async connect() {
        try {
            const tempConnection = await mysql.createConnection({
                host: this.config.host,
                user: this.config.user,
                password: this.config.password
            });

            await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS ${this.config.database}`);
            await tempConnection.end();

            this.connection = await mysql.createConnection(this.config);

            console.log('🐬 Connected to MySQL database');
            await this.createTables();

        } catch (error) {
            console.error('❌ MySQL connection failed:', error.message);
            throw error;
        }
    }

    async createTables() {
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL
            );
        `;




        const createNotesTable = `
            CREATE TABLE IF NOT EXISTS notes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) DEFAULT '',
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                userId INT,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            )
        `;

        try {
            await this.connection.execute(createUsersTable);
            await this.connection.execute(createNotesTable);
            console.log('📋 Tables ready');
        } catch (error) {
            console.error('❌ Error creating tables:', error.message);
            throw error;
        }
    }

    async getUserByEmail(email) {
    const [rows] = await this.connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
    );
    return rows[0]; // undefined if not found
    }

    async getAllNotesByUserId(userId) {
        const [rows] = await this.connection.execute(
            'SELECT id, title, content, created_at, updated_at FROM notes WHERE userId = ? ORDER BY created_at DESC',
            [userId]
        );
        return rows.map(note => ({
            ...note,
            createdAt: note.created_at.toISOString(),
            updatedAt: note.updated_at.toISOString()
        }));
    }

    async getAllNotes() {
        const [rows] = await this.connection.execute(
            'SELECT id, title, content, created_at, updated_at FROM notes ORDER BY created_at DESC'
        );
        return rows.map(note => ({
            ...note,
            createdAt: note.created_at.toISOString(),
            updatedAt: note.updated_at.toISOString()
        }));
    }

    async addNote(content, title = '', userId = null) {
        const [result] = await this.connection.execute(
            'INSERT INTO notes (title, content, userId) VALUES (?, ?, ?)',
            [title, content.trim(), userId]
        );

        const [rows] = await this.connection.execute(
            'SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ?',
            [result.insertId]
        );

        return {
            ...rows[0],
            createdAt: rows[0].created_at.toISOString(),
            updatedAt: rows[0].updated_at.toISOString()
        };
    }

    async deleteNote(noteId) {
        const [rows] = await this.connection.execute(
            'SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ?',
            [parseInt(noteId)]
        );

        if (rows.length === 0) {
            return null;
        }

        await this.connection.execute('DELETE FROM notes WHERE id = ?', [parseInt(noteId)]);

        return {
            ...rows[0],
            createdAt: rows[0].created_at.toISOString(),
            updatedAt: rows[0].updated_at.toISOString()
        };
    }

    async deleteNoteByUser(noteId, userId) {
        const [rows] = await this.connection.execute(
            'SELECT * FROM notes WHERE id = ? AND userId = ?',
            [noteId, userId]
        );
        if (rows.length === 0) return null;

        await this.connection.execute(
            'DELETE FROM notes WHERE id = ? AND userId = ?',
            [noteId, userId]
        );

        return {
            ...rows[0],
            createdAt: rows[0].created_at.toISOString(),
            updatedAt: rows[0].updated_at.toISOString()
        };
    }

    async updateNote(noteId, content, title = '') {
        const [result] = await this.connection.execute(
            'UPDATE notes SET title = ?, content = ? WHERE id = ?',
            [title, content.trim(), parseInt(noteId)]
        );

        if (result.affectedRows === 0) {
            return null;
        }

        const [rows] = await this.connection.execute(
            'SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ?',
            [parseInt(noteId)]
        );

        return {
            ...rows[0],
            createdAt: rows[0].created_at.toISOString(),
            updatedAt: rows[0].updated_at.toISOString()
        };
    }

    async getUserByUsername(username) {
        const [rows] = await this.connection.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        return rows[0];
    }

async createUser(username, email, password) {
    const [result] = await this.connection.execute(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, password]
    );
    return { id: result.insertId, username, email };
}


    async close() {
        if (this.connection) {
            await this.connection.end();
            console.log('🔌 MySQL connection closed');
        }
    }
}

module.exports = MySQLDatabase;
