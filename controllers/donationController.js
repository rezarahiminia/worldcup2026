const axios = require('axios');
const crypto = require('crypto');
const Donation = require('../models/donation');

// NOWPayments Configuration - loaded from environment variables
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;
const NOWPAYMENTS_API = 'https://api.nowpayments.io/v1';
const DONATION_WALLET = process.env.DONATION_WALLET_ADDRESS;

// Check if running in development/sandbox mode
const IS_DEV = process.env.NODE_ENV !== 'production';

// Helper: Generate unique order ID
const generateOrderId = () => {
    return `DON-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

// Helper: Verify IPN signature
const verifyIpnSignature = (payload, signature) => {
    const sortedPayload = Object.keys(payload)
        .sort()
        .reduce((acc, key) => {
            acc[key] = payload[key];
            return acc;
        }, {});
    
    const hmac = crypto.createHmac('sha512', NOWPAYMENTS_IPN_SECRET);
    hmac.update(JSON.stringify(sortedPayload));
    const calculatedSignature = hmac.digest('hex');
    
    return calculatedSignature === signature;
};

module.exports = (app) => {
    
    /**
     * @swagger
     * /donate/create:
     *   post:
     *     summary: Create a new donation payment
     *     tags: [Donation]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - amount
     *             properties:
     *               amount:
     *                 type: number
     *                 minimum: 1
     *                 maximum: 100
     *                 description: Donation amount in USD
     *               donor_name:
     *                 type: string
     *               donor_email:
     *                 type: string
     *               message:
     *                 type: string
     *     responses:
     *       200:
     *         description: Payment created successfully
     *       400:
     *         description: Invalid amount
     *       500:
     *         description: Server error
     */
    app.post('/donate/create', async (req, res) => {
        try {
            const { amount, donor_name, donor_email, message } = req.body;
            
            // Validate amount
            const amountNum = parseFloat(amount);
            if (isNaN(amountNum) || amountNum < 1 || amountNum > 100) {
                return res.status(400).json({
                    success: false,
                    error: 'Amount must be between 1 and 100 USD'
                });
            }
            
            const orderId = generateOrderId();
            
            // In development mode, use demo data (NOWPayments requires public URL for callbacks)
            if (IS_DEV) {
                console.log('🧪 DEV MODE: Creating demo donation payment');
                
                // Save demo donation to database
                const donation = new Donation({
                    payment_id: `demo_${Date.now()}`,
                    order_id: orderId,
                    donor_name: donor_name || 'Anonymous',
                    donor_email: donor_email,
                    donor_message: message,
                    amount_usd: amountNum,
                    pay_currency: 'usdttrc20',
                    pay_amount: amountNum,
                    pay_address: DONATION_WALLET,
                    status: 'waiting'
                });
                
                await donation.save();
                
                return res.json({
                    success: true,
                    payment_id: donation.payment_id,
                    pay_address: DONATION_WALLET,
                    pay_amount: amountNum,
                    pay_currency: 'usdttrc20',
                    order_id: orderId,
                    expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
                    demo_mode: true
                });
            }
            
            // Production: Create payment with NOWPayments
            const paymentResponse = await axios.post(
                `${NOWPAYMENTS_API}/payment`,
                {
                    price_amount: amountNum,
                    price_currency: 'usd',
                    pay_currency: 'usdttrc20',
                    order_id: orderId,
                    order_description: `Donation to FIFA World Cup 2026 Project - $${amountNum}`,
                    ipn_callback_url: `${req.protocol}://${req.get('host')}/donate/ipn`,
                    success_url: `${req.protocol}://${req.get('host')}/?donation=success`,
                    cancel_url: `${req.protocol}://${req.get('host')}/?donation=cancelled`
                },
                {
                    headers: {
                        'x-api-key': NOWPAYMENTS_API_KEY,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            const paymentData = paymentResponse.data;
            
            // Save donation to database
            const donation = new Donation({
                payment_id: paymentData.payment_id,
                order_id: orderId,
                donor_name: donor_name || 'Anonymous',
                donor_email: donor_email,
                donor_message: message,
                amount_usd: amountNum,
                pay_currency: paymentData.pay_currency,
                pay_amount: paymentData.pay_amount,
                pay_address: paymentData.pay_address,
                status: paymentData.payment_status || 'waiting'
            });
            
            await donation.save();
            
            res.json({
                success: true,
                payment_id: paymentData.payment_id,
                pay_address: paymentData.pay_address,
                pay_amount: paymentData.pay_amount,
                pay_currency: paymentData.pay_currency,
                order_id: orderId,
                expires_at: paymentData.expiration_estimate_date
            });
            
        } catch (error) {
            console.error('Create donation error:', error.response?.data || error.message);
            res.status(500).json({
                success: false,
                error: error.response?.data?.message || 'Failed to create payment'
            });
        }
    });
    
    /**
     * @swagger
     * /donate/ipn:
     *   post:
     *     summary: IPN Callback from NOWPayments
     *     tags: [Donation]
     *     description: This endpoint receives payment status updates from NOWPayments
     *     responses:
     *       200:
     *         description: IPN processed
     */
    app.post('/donate/ipn', async (req, res) => {
        try {
            const payload = req.body;
            const signature = req.headers['x-nowpayments-sig'];
            
            console.log('📥 IPN Received:', JSON.stringify(payload, null, 2));
            
            // Verify signature
            if (signature && !verifyIpnSignature(payload, signature)) {
                console.error('❌ Invalid IPN signature');
                return res.status(400).json({ error: 'Invalid signature' });
            }
            
            // Find and update donation
            const donation = await Donation.findOne({ 
                $or: [
                    { payment_id: payload.payment_id },
                    { order_id: payload.order_id }
                ]
            });
            
            if (!donation) {
                console.error('❌ Donation not found:', payload.order_id);
                return res.status(404).json({ error: 'Donation not found' });
            }
            
            // Update donation status
            donation.status = payload.payment_status;
            donation.actually_paid = payload.actually_paid;
            donation.updated_at = new Date();
            
            if (payload.payment_status === 'finished' || payload.payment_status === 'confirmed') {
                donation.paid_at = new Date();
            }
            
            await donation.save();
            
            console.log(`✅ Donation ${donation.order_id} updated: ${payload.payment_status}`);
            
            res.json({ success: true });
            
        } catch (error) {
            console.error('IPN Error:', error);
            res.status(500).json({ error: 'IPN processing failed' });
        }
    });
    
    /**
     * @swagger
     * /donate/status/{orderId}:
     *   get:
     *     summary: Check donation status
     *     tags: [Donation]
     *     parameters:
     *       - in: path
     *         name: orderId
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Donation status
     *       404:
     *         description: Donation not found
     */
    app.get('/donate/status/:orderId', async (req, res) => {
        try {
            const donation = await Donation.findOne({ order_id: req.params.orderId })
                .select('-__v')
                .lean();
            
            if (!donation) {
                return res.status(404).json({
                    success: false,
                    error: 'Donation not found'
                });
            }
            
            res.json({
                success: true,
                donation: {
                    order_id: donation.order_id,
                    amount_usd: donation.amount_usd,
                    status: donation.status,
                    donor_name: donation.donor_name,
                    created_at: donation.created_at,
                    paid_at: donation.paid_at
                }
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to get donation status'
            });
        }
    });
    
    /**
     * @swagger
     * /donate/recent:
     *   get:
     *     summary: Get recent successful donations
     *     tags: [Donation]
     *     responses:
     *       200:
     *         description: List of recent donations
     */
    app.get('/donate/recent', async (req, res) => {
        try {
            const donations = await Donation.find({
                status: { $in: ['finished', 'confirmed'] }
            })
            .select('donor_name amount_usd donor_message created_at')
            .sort({ created_at: -1 })
            .limit(10)
            .lean();
            
            // Calculate total
            const totalResult = await Donation.aggregate([
                { $match: { status: { $in: ['finished', 'confirmed'] } } },
                { $group: { _id: null, total: { $sum: '$amount_usd' }, count: { $sum: 1 } } }
            ]);
            
            const total = totalResult[0] || { total: 0, count: 0 };
            
            res.json({
                success: true,
                donations: donations.map(d => ({
                    name: d.donor_name || 'Anonymous',
                    amount: d.amount_usd,
                    message: d.donor_message,
                    date: d.created_at
                })),
                stats: {
                    total_amount: total.total,
                    total_donations: total.count
                }
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to get donations'
            });
        }
    });
    
    /**
     * @swagger
     * /donate/currencies:
     *   get:
     *     summary: Get available currencies (for future expansion)
     *     tags: [Donation]
     *     responses:
     *       200:
     *         description: Available currencies
     */
    app.get('/donate/currencies', async (req, res) => {
        // For now, we only support USDT-TRC20
        res.json({
            success: true,
            currencies: [
                {
                    code: 'usdttrc20',
                    name: 'USDT (TRC20)',
                    network: 'TRON',
                    min_amount: 1,
                    description: 'Tether USD on TRON network - Fast & Low fees'
                }
            ]
        });
    });
};
