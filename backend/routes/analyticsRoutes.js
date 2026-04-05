const express = require('express');
const router = express.Router();
const { getCategoryBreakdown, getMonthlyTrend, getIncomeVsExpense } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/category-breakdown', protect, getCategoryBreakdown);
router.get('/monthly-trend', protect, getMonthlyTrend);
router.get('/income-vs-expense', protect, getIncomeVsExpense);

module.exports = router;