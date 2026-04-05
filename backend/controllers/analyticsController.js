const Expense = require('../models/Expense');
const logger = require('../utils/logger');

// Get spending by category for a month (Pie chart data)
const getCategoryBreakdown = async (req, res) => {
    try {
        const { month, year } = req.query;
        const m = parseInt(month) || new Date().getMonth() + 1;
        const y = parseInt(year) || new Date().getFullYear();

        const data = await Expense.aggregate([
            {
                $match: {
                    user: require('mongoose').Types.ObjectId.createFromHexString(req.user.id),
                    type: 'expense',
                    date: {
                        $gte: new Date(y, m - 1, 1),
                        $lte: new Date(y, m, 0)
                    }
                }
            },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' }
                }
            }
        ]);

        logger.info(`Category breakdown fetched for user: ${req.user.id}`);
        res.status(200).json(data);

    } catch (err) {
        logger.error(`Category breakdown error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get month over month spending (Bar chart data)
const getMonthlyTrend = async (req, res) => {
    try {
        const data = await Expense.aggregate([
            {
                $match: {
                    user: require('mongoose').Types.ObjectId.createFromHexString(req.user.id),
                    type: 'expense'
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$date' },
                        year: { $year: '$date' }
                    },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        logger.info(`Monthly trend fetched for user: ${req.user.id}`);
        res.status(200).json(data);

    } catch (err) {
        logger.error(`Monthly trend error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get income vs expense trend (Line chart data)
const getIncomeVsExpense = async (req, res) => {
    try {
        const data = await Expense.aggregate([
            {
                $match: {
                    user: require('mongoose').Types.ObjectId.createFromHexString(req.user.id)
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$date' },
                        year: { $year: '$date' },
                        type: '$type'
                    },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        logger.info(`Income vs expense fetched for user: ${req.user.id}`);
        res.status(200).json(data);

    } catch (err) {
        logger.error(`Income vs expense error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getCategoryBreakdown, getMonthlyTrend, getIncomeVsExpense };