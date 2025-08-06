const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Test route to see if server is working
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!', timestamp: new Date() });
});

// List files in public directory (for debugging)
app.get('/debug', (req, res) => {
    const fs = require('fs');
    try {
        const publicPath = path.join(__dirname, 'public');
        const files = fs.readdirSync(publicPath);
        res.json({ 
            publicPath: publicPath,
            files: files,
            exists: fs.existsSync(publicPath)
        });
    } catch (error) {
        res.json({ error: error.message });
    }
});

// Serve main.html for root route
app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'main.html');
    console.log('Trying to serve:', filePath);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error serving main.html:', err);
            res.status(404).send(`
                <h1>File not found</h1>
                <p>Looking for: ${filePath}</p>
                <p>Error: ${err.message}</p>
                <a href="/debug">Debug info</a>
            `);
        }
    });
});

// Catch all other routes
app.get('*', (req, res) => {
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Test server running on http://localhost:${PORT}`);
    console.log('Available test endpoints:');
    console.log('GET / - Your main.html');
    console.log('GET /test - Server test');
    console.log('GET /debug - File listing');
    
    // Check if public folder exists
    const fs = require('fs');
    const publicPath = path.join(__dirname, 'public');
    if (!fs.existsSync(publicPath)) {
        console.log('⚠️  WARNING: public folder not found!');
        console.log('📁 Create it with: mkdir public');
    } else {
        console.log('✅ Public folder found');
        try {
            const files = fs.readdirSync(publicPath);
            console.log('📁 Files in public:', files);
        } catch (err) {
            console.log('❌ Error reading public folder:', err.message);
        }
    }
});
