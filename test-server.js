const express = require('express');
const app = express();

console.log('Starting simple test server...');

app.get('/', (req, res) => {
    console.log('Root endpoint hit');
    res.json({ message: 'Hello World' });
});

app.get('/api-docs', (req, res) => {
    console.log('Swagger endpoint hit');
    res.json({ message: 'Swagger would be here' });
});

app.listen(3051, () => {
    console.log('Simple server running on port 3051');
});