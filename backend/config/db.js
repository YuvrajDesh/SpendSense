const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/spendsense';
        if (!process.env.MONGO_URI) {
            logger.warn('MONGO_URI is not set. Falling back to mongodb://127.0.0.1:27017/spendsense');
        }
        await mongoose.connect(mongoURI);
        logger.info('MongoDB connected successfully');
    } catch (err) {
        logger.error('MongoDB connection failed', err);
        process.exit(1);
    }
};

module.exports = connectDB;