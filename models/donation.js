const path = require('path');
const dotenv = require('dotenv');

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
const config = {
  // محیط
  NODE_ENV,
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
  LOG_LEVEL: process.env.LOG_LEVEL || (NODE_ENV === 'production' ? 'error' : 'debug')
};

module.exports = config;const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    // Payment Info from NOWPayments
    payment_id: { type: String, unique: true, sparse: true },
    order_id: { type: String, unique: true, required: true },
    
    // Donor Info (optional)
    donor_name: { type: String, default: 'Anonymous' },
    donor_email: { type: String },
    donor_message: { type: String },
    
    // Payment Details
    amount_usd: { type: Number, required: true, min: 1, max: 100 },
    pay_currency: { type: String, default: 'usdttrc20' },
    pay_amount: { type: Number },
    actually_paid: { type: Number },
    
    // Status
    status: { 
        type: String, 
        enum: ['waiting', 'confirming', 'confirmed', 'sending', 'partially_paid', 'finished', 'failed', 'refunded', 'expired'],
        default: 'waiting'
    },
    
    // URLs
    pay_address: { type: String },
    invoice_url: { type: String },
    
    // Timestamps
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    paid_at: { type: Date }
    
}, { timestamps: true });

// Indexes
donationSchema.index({ status: 1 });
donationSchema.index({ created_at: -1 });
donationSchema.index({ payment_id: 1 });

module.exports = mongoose.model('Donation', donationSchema);
