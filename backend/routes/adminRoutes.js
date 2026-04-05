const express = require('express');
const router = express.Router();
const { getAllUsers, toggleUserStatus, getAllExpenses, getAllNotifications } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id/toggle', protect, adminOnly, toggleUserStatus);
router.get('/expenses', protect, adminOnly, getAllExpenses);
router.get('/notifications', protect, adminOnly, getAllNotifications);

module.exports = router;