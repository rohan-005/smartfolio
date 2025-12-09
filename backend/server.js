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
// const courseRoutes = require('./routes/courses');
// const codeRoutes = require('./routes/code');
// const courseProgressRoutes = require('./routes/courseProgress');
const adminRoutes = require('./routes/admin');

// Connect to database
const connectdb = require('./config/connectdb');
connectdb();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());// Routes
app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/admin', adminRoutes);

// app.use('/api/courses', courseRoutes);
// app.use('/api/code', codeRoutes);
// app.use('/api/progress', courseProgressRoutes);

// Test route
app.get('/api/health', (req, res) => {
    res.json({
        message: 'Server is running!',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});