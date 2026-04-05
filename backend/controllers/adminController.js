const User = require('../models/User');
const Expense = require('../models/Expense');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        logger.info(`Admin fetched all users: ${req.user.id}`);
        res.status(200).json(users);

    } catch (err) {
        logger.error(`Get all users error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

// Disable or enable a user account
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = !user.isActive;
        await user.save();

        const status = user.isActive ? 'enabled' : 'disabled';
        logger.info(`Admin ${req.user.id} ${status} user: ${user.email}`);
        res.status(200).json({ message: `User account ${status} successfully` });

    } catch (err) {
        logger.error(`Toggle user status error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all expenses across all users
const getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        logger.info(`Admin fetched all expenses: ${req.user.id}`);
        res.status(200).json(expenses);

    } catch (err) {
        logger.error(`Get all expenses error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all notifications across all users
const getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        logger.info(`Admin fetched all notifications: ${req.user.id}`);
        res.status(200).json(notifications);

    } catch (err) {
        logger.error(`Get all notifications error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAllUsers, toggleUserStatus, getAllExpenses, getAllNotifications };