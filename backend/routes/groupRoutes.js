const express = require('express');
const router = express.Router();
const { createGroup, getGroups, addMember, addGroupExpense, getGroupExpenses, markSplitAsPaid } = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createGroup);
router.get('/', protect, getGroups);
router.post('/:id/members', protect, addMember);
router.post('/:id/expenses', protect, addGroupExpense);
router.get('/:id/expenses', protect, getGroupExpenses);
router.put('/:id/expenses/:expenseId/split/:memberId/pay', protect, markSplitAsPaid);

module.exports = router;