// Load environment configuration
const { loadEnvConfig, config } = require('./config/env');
const nodeEnv = loadEnvConfig();

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');

// Catch unhandled errors
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    console.error(err.stack);
    // Don't exit in dev
    // if (config.isProd) process.exit(1);
});
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
    console.error(err.stack);
    // Don't exit in dev
    // if (config.isProd) process.exit(1);
});

const app = express();
const PORT = config.PORT;

// Trust proxy - MUST be set when behind nginx/reverse proxy
// Fixes: ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
app.set('trust proxy', 1);

// Swagger setup (only in development or if explicitly enabled)
let swaggerUi, specs;
console.log(`🔍 ENABLE_SWAGGER value: ${config.ENABLE_SWAGGER}`);
if (config.ENABLE_SWAGGER) {
    try {
        const swagger = require('./swagger');
        swaggerUi = swagger.swaggerUi;
        specs = swagger.specs;
        console.log(`✅ Swagger loaded: swaggerUi=${!!swaggerUi}, specs=${!!specs}`);
    } catch(err) {
        console.error('❌ Swagger failed to load:', err.message);
    }
} else {
    console.log('⚠️ Swagger is disabled');
}

// CORS - must be before other middleware
const corsOrigins = config.getCorsOrigins();
app.use(cors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
}));

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Compression for faster responses
app.use(compression());

// Rate limiting - configurable per environment
const limiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW,
    max: config.RATE_LIMIT_MAX,
    message: {
        error: 'Too many requests, please try again later.',
        retryAfter: '1 second'
    },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
});
app.use(limiter);

// Logging - always enabled
app.use(morgan(':date[iso] :method :url :status :res[content-length] - :response-time ms'));

// Request logger - log every request with details
app.use((req, res, next) => {
    const start = Date.now();
    console.log(`📥 ${req.method} ${req.url} from ${req.ip}`);
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusIcon = res.statusCode >= 400 ? '❌' : '✅';
        console.log(`${statusIcon} ${req.method} ${req.url} → ${res.statusCode} (${duration}ms)`);
    });
    
    next();
});

console.log(`🌍 Environment: ${config.NODE_ENV}`);
console.log(`📊 Rate Limit: ${config.RATE_LIMIT_MAX} req/${config.RATE_LIMIT_WINDOW}ms`);
console.log(`🔗 CORS Origin: ${typeof corsOrigins === 'string' ? corsOrigins : corsOrigins.join(', ')}`);

app.use(bodyParser.urlencoded({ extended: false }));
const path = require('path');

app.use(bodyParser.json({ limit: '10kb' })); // Limit body size

// Serve static files (UI)
app.use(express.static(path.join(__dirname, 'public')));

// Swagger Documentation
if (swaggerUi && specs) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'FIFA World Cup 2026 API Documentation'
    }));
    console.log('📚 Swagger UI available at /api-docs');
} else {
    console.log('⚠️ Swagger NOT mounted! swaggerUi:', !!swaggerUi, 'specs:', !!specs);
}

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome endpoint
 *     description: Returns API welcome message
 *     tags: [General]
 *     security: []
 *     responses:
 *       200:
 *         description: Welcome message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome to FIFA World Cup 2026 API
 */
// Serve UI for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

require('./controllers/index')(app);

app.use((req, res, next) => {
    console.log(`⚠️ 404 Not Found: ${req.method} ${req.url} from ${req.ip}`);
    const erro = new Error('Route not found');
    erro.status = 404;
    next(erro);
});

app.use((error, req, res, next) => {
    console.error(`❌ Error ${error.status || 500}: ${error.message} | ${req.method} ${req.url}`);
    if (error.stack) console.error(error.stack);
    res.status(error.status || 500);
    return res.send({
        error: {
            message: error.message
        }
    })
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
