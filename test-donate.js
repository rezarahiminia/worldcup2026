// Simple test for donation API
const http = require('http');

const data = JSON.stringify({
    amount: 10,
    donor_name: 'Test User'
});

const options = {
    hostname: 'localhost',
    port: 3050,
    path: '/donate/create',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, res => {
    console.log(`Status: ${res.statusCode}`);
    
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
        console.log('Response:', body);
        try {
            const json = JSON.parse(body);
            console.log('\nParsed:', JSON.stringify(json, null, 2));
        } catch (e) {
            console.log('Not JSON');
        }
    });
});

req.on('error', e => {
    console.error('Error:', e.message);
});

req.write(data);
req.end();
