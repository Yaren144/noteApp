// API Client for Notes App
class NotesAPI {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.token = localStorage.getItem('notesApp_token') || null;
    }

    // Helper method for making API requests
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add authorization header if token exists
        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Login method
    async login(password) {
        try {
            const response = await this.makeRequest('/login', {
                method: 'POST',
                body: JSON.stringify({ password })
            });

            // Store token for future requests
            this.token = response.token;
            localStorage.setItem('notesApp_token', this.token);

            return response;
        } catch (error) {
            throw new Error('Invalid password');
        }
    }

    // Logout method
    logout() {
        this.token = null;
        localStorage.removeItem('notesApp_token');
    }

    // Get all notes
    async getNotes() {
        return await this.makeRequest('/notes');
    }

    // Add a new note
    async addNote(content, title = '') {
        return await this.makeRequest('/notes', {
            method: 'POST',
            body: JSON.stringify({ content, title })
        });
    }

    // Delete a note
    async deleteNote(noteId) {
        return await this.makeRequest(`/notes/${noteId}`, {
            method: 'DELETE'
        });
    }

    // Update a note (bonus feature)
    async updateNote(noteId, content, title = '') {
        return await this.makeRequest(`/notes/${noteId}`, {
            method: 'PUT',
            body: JSON.stringify({ content, title })
        });
    }
}

// Initialize the API client
window.notesAPI = new NotesAPI();