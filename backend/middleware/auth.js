const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // If token was generated for a regular user it will contain an `id`.
      // Admin tokens (created by the admin login) may not contain an id and
      // instead carry role/isAdmin flags. Support both cases.
      if (decoded && decoded.id) {
        req.user = await User.findById(decoded.id).select('-password');
      } else if (decoded && decoded.role === 'admin') {
        // Create a minimal user-like object for admin-only tokens so downstream
        // middleware (e.g., `admin`) can check `req.user.role`.
        req.user = { role: 'admin' };
      } else {
        req.user = null;
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };