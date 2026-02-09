/**
 * Simple Load Test Script for World Cup 2026 API
 * Tests API performance under high load (200+ requests/second)
 * 
 * Usage: node load-test.js [url] [requests] [concurrency]
 * Example: node load-test.js http://localhost:3050/get/teams 1000 200
 */

const http = require('http');
const https = require('https');

// Configuration
const config = {
    url: process.argv[2] || 'http://localhost:3050/get/teams',
    totalRequests: parseInt(process.argv[3]) || 1000,
    concurrency: parseInt(process.argv[4]) || 200,
    token: process.argv[5] || 'YOUR_JWT_TOKEN_HERE'
};

// Stats
const stats = {
    completed: 0,
    success: 0,
    failed: 0,
    totalTime: 0,
    responseTimes: [],
    errors: {},
    startTime: 0
};

function makeRequest() {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const urlObj = new URL(config.url);
        const client = urlObj.protocol === 'https:' ? https : http;
        
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${config.token}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        };

        const req = client.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                stats.responseTimes.push(responseTime);
                stats.completed++;
                
                if (res.statusCode >= 200 && res.statusCode < 400) {
                    stats.success++;
                } else {
                    stats.failed++;
                    stats.errors[res.statusCode] = (stats.errors[res.statusCode] || 0) + 1;
                }
                resolve();
            });
        });

        req.on('error', (err) => {
            stats.completed++;
            stats.failed++;
            stats.errors[err.code] = (stats.errors[err.code] || 0) + 1;
            resolve();
        });

        req.on('timeout', () => {
            req.destroy();
            stats.completed++;
            stats.failed++;
            stats.errors['TIMEOUT'] = (stats.errors['TIMEOUT'] || 0) + 1;
            resolve();
        });

        req.end();
    });
}

async function runBatch(batchSize) {
    const promises = [];
    for (let i = 0; i < batchSize; i++) {
        promises.push(makeRequest());
    }
    await Promise.all(promises);
}

async function runLoadTest() {
    console.log('\n🚀 World Cup 2026 API - Load Test');
    console.log('═'.repeat(50));
    console.log(`📍 URL: ${config.url}`);
    console.log(`📊 Total Requests: ${config.totalRequests}`);
    console.log(`⚡ Concurrency: ${config.concurrency}`);
    console.log('═'.repeat(50));
    console.log('\n⏳ Running test...\n');

    stats.startTime = Date.now();
    
    const batches = Math.ceil(config.totalRequests / config.concurrency);
    
    for (let i = 0; i < batches; i++) {
        const remaining = config.totalRequests - (i * config.concurrency);
        const batchSize = Math.min(config.concurrency, remaining);
        await runBatch(batchSize);
        
        // Progress bar
        const progress = Math.round((stats.completed / config.totalRequests) * 100);
        process.stdout.write(`\r   Progress: [${'█'.repeat(progress / 5)}${'░'.repeat(20 - progress / 5)}] ${progress}% (${stats.completed}/${config.totalRequests})`);
    }

    const totalTime = (Date.now() - stats.startTime) / 1000;
    
    // Calculate statistics
    const sortedTimes = stats.responseTimes.sort((a, b) => a - b);
    const avgTime = sortedTimes.reduce((a, b) => a + b, 0) / sortedTimes.length;
    const minTime = sortedTimes[0] || 0;
    const maxTime = sortedTimes[sortedTimes.length - 1] || 0;
    const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.50)] || 0;
    const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0;
    const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)] || 0;
    const rps = stats.completed / totalTime;

    // Print results
    console.log('\n\n');
    console.log('═'.repeat(50));
    console.log('📊 RESULTS');
    console.log('═'.repeat(50));
    
    console.log('\n🎯 Summary:');
    console.log(`   Total Requests:    ${stats.completed}`);
    console.log(`   ✅ Successful:     ${stats.success} (${(stats.success/stats.completed*100).toFixed(1)}%)`);
    console.log(`   ❌ Failed:         ${stats.failed} (${(stats.failed/stats.completed*100).toFixed(1)}%)`);
    console.log(`   ⏱️  Total Time:     ${totalTime.toFixed(2)}s`);
    console.log(`   🚀 Requests/sec:   ${rps.toFixed(2)}`);
    
    console.log('\n⏱️  Response Times:');
    console.log(`   Min:     ${minTime}ms`);
    console.log(`   Avg:     ${avgTime.toFixed(2)}ms`);
    console.log(`   Max:     ${maxTime}ms`);
    console.log(`   P50:     ${p50}ms`);
    console.log(`   P95:     ${p95}ms`);
    console.log(`   P99:     ${p99}ms`);

    if (Object.keys(stats.errors).length > 0) {
        console.log('\n❌ Errors:');
        for (const [code, count] of Object.entries(stats.errors)) {
            console.log(`   ${code}: ${count}`);
        }
    }

    console.log('\n═'.repeat(50));
    
    // Performance rating
    let rating = '🔴 Poor';
    if (rps >= 200 && stats.success / stats.completed >= 0.99) {
        rating = '🟢 Excellent';
    } else if (rps >= 100 && stats.success / stats.completed >= 0.95) {
        rating = '🟡 Good';
    } else if (rps >= 50) {
        rating = '🟠 Acceptable';
    }
    
    console.log(`\n📈 Performance Rating: ${rating}`);
    console.log(`   Target: 200 req/s | Achieved: ${rps.toFixed(0)} req/s`);
    
    if (rps >= 200) {
        console.log('\n✅ API can handle 200+ requests per second!');
    } else {
        console.log(`\n⚠️  API needs optimization to reach 200 req/s target`);
    }
    
    console.log('\n');
}

// Run the test
runLoadTest().catch(console.error);
