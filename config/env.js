const path = require('path');
const dotenv = require('dotenv');

let configLoaded = false;
let config = null;

// تابع بارگذاری تنظیمات محیطی
function loadEnvConfig() {
  if (configLoaded) return config;

  // تعیین محیط اجرا 
  const NODE_ENV = process.env.NODE_ENV || 'development';

  // بارگذاری فایل env مناسب
  const envFile = NODE_ENV === 'production' ? '.env.production' : '.env.development';
  const envPath = path.resolve(process.cwd(), envFile);

  // بارگذاری متغیرهای محیطی
  const result = dotenv.config({ path: envPath });

  if (result.error) {
    console.warn(`⚠️ فایل ${envFile} یافت نشد، استفاده از مقادیر پیش‌فرض`);
    // بارگذاری .env پیش‌فرض
    dotenv.config();
  }

  console.log(`🌍 محیط: ${NODE_ENV}`);
  console.log(`📁 فایل env: ${envFile}`);

  // تنظیمات پیش‌فرض
  config = {
    // محیط
    NODE_ENV,
    isDev: NODE_ENV === 'development',
    isProd: NODE_ENV === 'production',
    isDevelopment: NODE_ENV === 'development',
    isProduction: NODE_ENV === 'production',

    // سرور
    PORT: parseInt(process.env.PORT) || 3050,
    API_URL: process.env.API_URL || `http://localhost:${process.env.PORT || 3050}`,
    FRONTEND_URL: process.env.FRONTEND_URL || `http://localhost:${process.env.PORT || 3050}`,

    // دیتابیس
    MONGODB_URL: process.env.MONGODB_URL || 'mongodb://localhost:27017/worldcup2026',

    // امنیت
    JWT_SECRET: process.env.JWT_SECRET || 'worldcup2026_dev_secret_key',
    SECRET: process.env.SECRET || 'worldcup2026_secret',
    ACCESSCODEDEV: process.env.ACCESSCODEDEV || 'devcode123',

    // Rate Limiting
    RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000,
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 500,

    // CORS
    CORS_ORIGINS: process.env.CORS_ORIGINS || '*',

    // NOWPayments
    NOWPAYMENTS_API_KEY: process.env.NOWPAYMENTS_API_KEY || '',
    NOWPAYMENTS_IPN_SECRET: process.env.NOWPAYMENTS_IPN_SECRET || '',
    NOWPAYMENTS_PUBLIC_KEY: process.env.NOWPAYMENTS_PUBLIC_KEY || '',
    DONATION_WALLET_ADDRESS: process.env.DONATION_WALLET_ADDRESS || '',

    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || (NODE_ENV === 'production' ? 'error' : 'debug'),

    // Swagger
    ENABLE_SWAGGER: process.env.ENABLE_SWAGGER === 'true' || NODE_ENV === 'development',

    // تابع برای دریافت CORS origins
    getCorsOrigins: function() {
      const origins = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || '*';
      if (origins === '*') return '*';
      return origins.split(',').map(o => o.trim());
    }
  };

  configLoaded = true;
  return config;
}

// Export both function and config object
module.exports = { loadEnvConfig, config: null };

// Getter for config to ensure it's loaded
Object.defineProperty(module.exports, 'config', {
  get: function() {
    if (!config) loadEnvConfig();
    return config;
  }
});