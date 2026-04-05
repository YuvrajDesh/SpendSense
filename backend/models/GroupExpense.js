const mongoose = require('mongoose');

const splitDetailSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        default: 0
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    paidAt: {
        type: Date
    }
});

const groupExpenseSchema = new mongoose.Schema({
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true
    },
    splitType: {
        type: String,
        enum: ['equal', 'unequal', 'percentage'],
        default: 'equal'
    },
    splitDetails: [splitDetailSchema],
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('GroupExpense', groupExpenseSchema);