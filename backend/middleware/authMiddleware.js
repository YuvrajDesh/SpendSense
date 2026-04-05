const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Protect route - check if user is logged in
const protect = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token, access denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();

    } catch (err) {
        logger.error(`Auth middleware error: ${err.message}`);
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Admin only route
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied, admin only' });
    }
    next();
};

module.exports = { protect, adminOnly };