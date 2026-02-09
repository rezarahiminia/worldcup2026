const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const SecretEnv = process.env.SECRET;
const User = require('../models/user');

function generateToken(params = {}){
    return jwt.sign(params, SecretEnv, {
        expiresIn: 7257600
    });
};

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *       400:
 *         description: User already exists or registration failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', async(req,res) => {
    const { email } = req.body
    try{
        if(await User.findOne({ email })){
            return res.status(400).send({
                error: 'User already exists'
            });
        };
        const user = await User.create(req.body);
        user.password = undefined; // To dont show the password

        return res.send({
            user,
            token: generateToken({id: user.id})
        });

    }catch(err){
        return res.status(400).send({
            error: 'Registration failed'
        });
    };
});

/**
 * @swagger
 * /auth/authenticate:
 *   post:
 *     summary: Login user
 *     description: Authenticate user with email and password
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *       400:
 *         description: User not found or invalid password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/authenticate', async(req,res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email}).select('+password');

    if(!user){
        return res.status(400).send({
            error: 'User not found'
        });
    };
    if(!await bcrypt.compare(password, user.password)){
        return res.status(400).send({
            error: 'Invalid password'
        });
    };
    user.password = undefined;

    res.send({
        user,
        token: generateToken({id:user.id})
    });
});

module.exports = app => app.use('/auth', router);
