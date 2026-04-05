const Expense = require('../models/Expense');
const logger = require('../utils/logger');

// Export expenses as CSV
const exportCSV = async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });

        // Create CSV header
        const csvHeader = 'Date,Type,Category,Amount,Tags,Notes\n';

        // Create CSV rows
        const csvRows = expenses.map((expense) => {
            const date = new Date(expense.date).toLocaleDateString();
            const type = expense.type;
            const category = expense.category;
            const amount = expense.amount;
            const tags = expense.tags.join(' | ');
            const notes = expense.notes || '';
            return `${date},${type},${category},${amount},${tags},${notes}`;
        });

        const csvContent = csvHeader + csvRows.join('\n');

        logger.info(`CSV exported for user: ${req.user.id}`);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=spendsense_expenses.csv');
        res.status(200).send(csvContent);

    } catch (err) {
        logger.error(`Export CSV error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { exportCSV };