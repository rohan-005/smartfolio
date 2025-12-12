const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();

// Import routes
const authRoutes = require('./routes/auth');
const otpRoutes = require('./routes/otp');
const adminRoutes = require('./routes/admin');

// ⭐ NEW — Portfolio & Assets Routes
const assetRoutes = require('./routes/assets');
const portfolioRoutes = require('./routes/portfolio');

// Connect to database
const connectdb = require('./config/connectdb');
connectdb();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL, // e.g. http://localhost:5173
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// -------------------- API ROUTES --------------------
app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/admin', adminRoutes);

// ⭐ NEW — Required for your dashboard
app.use('/api/assets', assetRoutes);
app.use('/api/portfolio', portfolioRoutes);

// -------------------- HEALTH CHECK --------------------
app.get('/api/health', (req, res) => {
    res.json({
        message: 'Server is running!',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString()
    });
});

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
