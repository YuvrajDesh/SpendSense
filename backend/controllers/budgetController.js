const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const logger = require('../utils/logger');

// Set budget
const setBudget = async (req, res) => {
    try {
        const { category, limit, month, year } = req.body;

        // Check if budget already exists for this category and month
        const existingBudget = await Budget.findOne({
            user: req.user.id,
            category,
            month,
            year
        });

        if (existingBudget) {
            // Update existing budget
            existingBudget.limit = limit;
            await existingBudget.save();
            logger.info(`Budget updated for user: ${req.user.id}, category: ${category}`);
            return res.status(200).json(existingBudget);
        }

        // Create new budget
        const budget = await Budget.create({
            user: req.user.id,
            category,
            limit,
            month,
            year
        });

        logger.info(`Budget set for user: ${req.user.id}, category: ${category}, limit: ${limit}`);
        res.status(201).json(budget);

    } catch (err) {
        logger.error(`Set budget error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all budgets with spending progress
const getBudgets = async (req, res) => {
    try {
        const { month, year } = req.query;

        const budgets = await Budget.find({
            user: req.user.id,
            month: month || new Date().getMonth() + 1,
            year: year || new Date().getFullYear()
        });

        // Calculate spending for each budget
        const budgetsWithProgress = await Promise.all(budgets.map(async (budget) => {
            const totalSpent = await Expense.aggregate([
                {
                    $match: {
                        user: budget.user,
                        type: 'expense',
                        category: budget.category,
                        date: {
                            $gte: new Date(budget.year, budget.month - 1, 1),
                            $lte: new Date(budget.year, budget.month, 0)
                        }
                    }
                },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            const spent = totalSpent[0]?.total || 0;
            const percentage = Math.min((spent / budget.limit) * 100, 100).toFixed(2);

            return {
                ...budget.toObject(),
                spent,
                percentage
            };
        }));

        res.status(200).json(budgetsWithProgress);

    } catch (err) {
        logger.error(`Get budgets error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete budget
const deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findOne({ _id: req.params.id, user: req.user.id });

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        await Budget.findByIdAndDelete(req.params.id);

        logger.info(`Budget deleted for user: ${req.user.id}, budgetId: ${req.params.id}`);
        res.status(200).json({ message: 'Budget deleted successfully' });

    } catch (err) {
        logger.error(`Delete budget error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { setBudget, getBudgets, deleteBudget };