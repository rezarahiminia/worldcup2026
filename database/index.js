const mongoose = require('mongoose');

// Set strictQuery before connection
mongoose.set('strictQuery', false);

// MongoDB connection - Configuration from environment variables
const isProd = process.env.NODE_ENV === 'production';

const MONGODB_CONFIG = isProd ? {
    url: process.env.MONGODB_URL,
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
    }
} : {
    url: process.env.MONGODB_URL || 'mongodb://localhost:27017/worldcup2026',
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
    }
};

console.log(`🔌 Connecting to MongoDB (${isProd ? 'Production' : 'Development'})...`);

mongoose.connect(MONGODB_CONFIG.url, MONGODB_CONFIG.options)
.then(() => {
    console.log("✅ Successful connection with MongoDB");
}).catch((err) => {
    console.log('❌ Error: Connection to MongoDB not successful', err.message);
    process.exit(1);
});

mongoose.Promise = global.Promise;

module.exports = mongoose;
