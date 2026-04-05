const Notification = require('../models/Notification');
const logger = require('../utils/logger');

// Get all notifications for logged in user
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json(notifications);

    } catch (err) {
        logger.error(`Get notifications error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark notification as read
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.isRead = true;
        await notification.save();

        logger.info(`Notification marked as read: ${req.params.id}`);
        res.status(200).json({ message: 'Notification marked as read' });

    } catch (err) {
        logger.error(`Mark as read error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user.id, isRead: false },
            { isRead: true }
        );

        logger.info(`All notifications marked as read for user: ${req.user.id}`);
        res.status(200).json({ message: 'All notifications marked as read' });

    } catch (err) {
        logger.error(`Mark all as read error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };