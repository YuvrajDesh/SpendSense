const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

// Add expense or income
const addExpense = async (req, res) => {
    try {
        const { type, amount, category, tags, notes, date } = req.body;

        const expense = await Expense.create({
            user: req.user.id,
            type,
            amount,
            category,
            tags,
            notes,
            date
        });

        logger.info(`New ${type} added by user: ${req.user.id}, amount: ${amount}, category: ${category}`);

        // Check budget if it's an expense
        if (type === 'expense') {
            const now = new Date();
            const budget = await Budget.findOne({
                user: req.user.id,
                category,
                month: now.getMonth() + 1,
                year: now.getFullYear()
            });

            if (budget) {
                // Calculate total spending in this category this month
                const totalSpent = await Expense.aggregate([
                    {
                        $match: {
                            user: expense.user,
                            type: 'expense',
                            category,
                            date: {
                                $gte: new Date(now.getFullYear(), now.getMonth(), 1),
                                $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0)
                            }
                        }
                    },
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ]);

                const spent = totalSpent[0]?.total || 0;
                const percentage = (spent / budget.limit) * 100;

                if (percentage >= 100) {
                    await Notification.create({
                        user: req.user.id,
                        message: `Budget breached for ${category}! Spent ₹${spent} of ₹${budget.limit}`,
                        type: 'budget_breach'
                    });
                    logger.warn(`Budget breached for user: ${req.user.id}, category: ${category}`);
                } else if (percentage >= 80) {
                    await Notification.create({
                        user: req.user.id,
                        message: `Warning! You have used 80% of your ${category} budget`,
                        type: 'budget_warning'
                    });
                    logger.warn(`Budget warning for user: ${req.user.id}, category: ${category}`);
                }
            }

            // Large transaction alert
            if (amount >= 10000) {
                await Notification.create({
                    user: req.user.id,
                    message: `Large transaction detected! ₹${amount} spent on ${category}`,
                    type: 'large_transaction'
                });
                logger.warn(`Large transaction detected for user: ${req.user.id}, amount: ${amount}`);
            }
        }

        res.status(201).json(expense);

    } catch (err) {
        logger.error(`Add expense error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all expenses for logged in user
const getExpenses = async (req, res) => {
    try {
        const { category, type, startDate, endDate, tag } = req.query;

        let filter = { user: req.user.id };

        if (category) filter.category = category;
        if (type) filter.type = type;
        if (tag) filter.tags = tag;
        if (startDate && endDate) {
            filter.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const expenses = await Expense.find(filter).sort({ date: -1 });
        res.status(200).json(expenses);

    } catch (err) {
        logger.error(`Get expenses error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update expense
const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findOne({ _id: req.params.id, user: req.user.id });

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });

        logger.info(`Expense updated by user: ${req.user.id}, expenseId: ${req.params.id}`);
        res.status(200).json(updated);

    } catch (err) {
        logger.error(`Update expense error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete expense
const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findOne({ _id: req.params.id, user: req.user.id });

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        await Expense.findByIdAndDelete(req.params.id);

        logger.info(`Expense deleted by user: ${req.user.id}, expenseId: ${req.params.id}`);
        res.status(200).json({ message: 'Expense deleted successfully' });

    } catch (err) {
        logger.error(`Delete expense error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { addExpense, getExpenses, updateExpense, deleteExpense };