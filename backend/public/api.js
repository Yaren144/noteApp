// API Client for Notes App
class NotesAPI {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.token = localStorage.getItem('notesAppToken') || null;
    }

    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
                ...options.headers
            }
        };

        if (options.body) {
            config.body = typeof options.body === 'string'
                ? options.body
                : JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data.error || 
                    (response.status === 401 ? 'Invalid credentials' : 'Request failed');
                throw new Error(errorMsg);
            }

            return data;
        } catch (error) {
            console.error(`API Request to ${endpoint} failed:`, error);
            throw error;
        }
    }

    async register(username, email, password) {
    try {
        const response = await this.makeRequest('/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
        
        if (!response.token) {
            throw new Error('Registration failed - no token received');
        }
        
        this.token = response.token;
        localStorage.setItem('notesAppToken', this.token);
        return response;
    } catch (error) {
        console.error('Registration failed:', error);
        throw error;
    }
}
    
    
    
    async login(username, password) {
    try {
        const response = await this.makeRequest('/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        if (!response.token) {
            throw new Error('No token received');
        }
        
        this.token = response.token;
        localStorage.setItem('notesAppToken', this.token);
        return response;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
}
    
    logout() {
        this.token = null;
        localStorage.removeItem('notesAppToken');
    }


    async getNotes() {
        return await this.makeRequest('/notes');
    }

    
    async addNote(content, title = '') {
        return await this.makeRequest('/notes', {
            method: 'POST',
            body: JSON.stringify({ content, title })
        });
    }


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
