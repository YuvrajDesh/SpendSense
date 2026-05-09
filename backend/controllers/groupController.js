const Group = require('../models/Group');
const User = require('../models/User');
const GroupExpense = require('../models/GroupExpense');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

// Create group
const createGroup = async (req, res) => {
    try {
        const { name, description } = req.body;
        const group = await Group.create({
            name,
            description,
            createdBy: req.user.id,
            members: [req.user.id]
        });
        logger.info(`Group created by user: ${req.user.id}, groupName: ${name}`);
        res.status(201).json(group);
    } catch (err) {
        logger.error(`Create group error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all groups for logged in user
const getGroups = async (req, res) => {
    try {
        const groups = await Group.find({ members: req.user.id })
            .populate('members', 'name email')
            .populate('createdBy', 'name email');
        res.status(200).json(groups);
    } catch (err) {
        logger.error(`Get groups error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add member to group
const addMember = async (req, res) => {
    try {
        const { email } = req.body;
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        if (group.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only group creator can add members' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (group.members.includes(user._id)) {
            return res.status(400).json({ message: 'User is already a member' });
        }

        group.members.push(user._id);
        await group.save();

        await Notification.create({
            user: user._id,
            message: `You have been added to group: ${group.name}`,
            type: 'group_activity'
        });

        logger.info(`Member added to group: ${group.name}, member: ${email}`);
        res.status(200).json({ message: 'Member added successfully', group });
    } catch (err) {
        logger.error(`Add member error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add group expense with split options
const addGroupExpense = async (req, res) => {
    try {
        const { description, amount, splitType, splitDetails } = req.body;

        const group = await Group.findById(req.params.id).populate('members', 'name email');
        if (!group) return res.status(404).json({ message: 'Group not found' });

        if (!group.members.find(m => m._id.toString() === req.user.id)) {
            return res.status(403).json({ message: 'You are not a member of this group' });
        }

        let computedSplitDetails = [];

        if (splitType === 'equal') {
            const splitAmount = parseFloat((amount / splitDetails.length).toFixed(2));
            computedSplitDetails = splitDetails.map(memberId => ({
                user: memberId,
                amount: splitAmount,
                percentage: parseFloat((100 / splitDetails.length).toFixed(2)),
                isPaid: memberId.toString() === req.user.id
            }));

        } else if (splitType === 'unequal') {
            const total = splitDetails.reduce((sum, s) => sum + parseFloat(s.amount), 0);
            if (Math.round(total) !== Math.round(amount)) {
                return res.status(400).json({ message: `Split amounts must add up to ₹${amount}` });
            }
            computedSplitDetails = splitDetails.map(s => ({
                user: s.userId,
                amount: parseFloat(s.amount),
                percentage: parseFloat(((s.amount / amount) * 100).toFixed(2)),
                isPaid: s.userId.toString() === req.user.id
            }));

        } else if (splitType === 'percentage') {
            const totalPercentage = splitDetails.reduce((sum, s) => sum + parseFloat(s.percentage), 0);
            if (Math.round(totalPercentage) !== 100) {
                return res.status(400).json({ message: 'Percentages must add up to 100%' });
            }
            computedSplitDetails = splitDetails.map(s => ({
                user: s.userId,
                amount: parseFloat(((s.percentage / 100) * amount).toFixed(2)),
                percentage: parseFloat(s.percentage),
                isPaid: s.userId.toString() === req.user.id
            }));
        }

        const groupExpense = await GroupExpense.create({
            group: req.params.id,
            paidBy: req.user.id,
            description,
            amount,
            splitType,
            splitDetails: computedSplitDetails
        });

        // Notify all members except paidBy
        await Promise.all(computedSplitDetails.map(async (split) => {
            if (split.user.toString() !== req.user.id) {
                await Notification.create({
                    user: split.user,
                    message: `You owe ₹${split.amount} for "${description}" in group "${group.name}"`,
                    type: 'group_activity'
                });
            }
        }));

        logger.info(`Group expense added: ${description}, amount: ${amount}, splitType: ${splitType}`);
        res.status(201).json(groupExpense);
    } catch (err) {
        logger.error(`Add group expense error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark split as paid
const markSplitAsPaid = async (req, res) => {
    try {
        const { expenseId, memberId } = req.params;

        const expense = await GroupExpense.findById(expenseId).populate('group');
        if (!expense) return res.status(404).json({ message: 'Expense not found' });

        const split = expense.splitDetails.find(s => s.user.toString() === memberId);
        if (!split) return res.status(404).json({ message: 'Split not found' });

        split.isPaid = true;
        split.paidAt = new Date();
        await expense.save();

        // Notify the person who paid for the group expense
        await Notification.create({
            user: expense.paidBy,
            message: `A member has paid their share of ₹${split.amount} for "${expense.description}" in group "${expense.group.name}"`,
            type: 'group_activity'
        });

        logger.info(`Split marked as paid for expense: ${expenseId}, member: ${memberId}`);
        res.status(200).json({ message: 'Split marked as paid' });
    } catch (err) {
        logger.error(`Mark split as paid error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get group expenses
const getGroupExpenses = async (req, res) => {
    try {
        const expenses = await GroupExpense.find({ group: req.params.id })
            .populate('paidBy', 'name email')
            .populate('splitDetails.user', 'name email')
            .sort({ date: -1 });
        res.status(200).json(expenses);
    } catch (err) {
        logger.error(`Get group expenses error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};
// Settle up between two members
const settleUp = async (req, res) => {
    try {
        const { id } = req.params; // group id
        const { memberId } = req.body; // person who is settling

        // Find all unpaid splits where current user owes memberId
        const expenses = await GroupExpense.find({ group: id })
            .populate('paidBy', 'name email')
            .populate('splitDetails.user', 'name email');

        let totalSettled = 0;
        let settledCount = 0;

        for (const expense of expenses) {
            if (expense.paidBy._id.toString() === memberId) {
                for (const split of expense.splitDetails) {
                    if (split.user._id.toString() === req.user.id && !split.isPaid) {
                        split.isPaid = true;
                        split.paidAt = new Date();
                        totalSettled += split.amount;
                        settledCount++;
                    }
                }
                await expense.save();
            }
        }

        if (settledCount === 0) {
            return res.status(400).json({ message: 'No pending splits found' });
        }

        // Get group name
        const group = await Group.findById(id);

        // Notify the person being settled with
        await Notification.create({
            user: memberId,
            message: `${req.user.name || 'A member'} has settled up ₹${totalSettled.toFixed(2)} with you in group "${group.name}"`,
            type: 'group_activity'
        });

        logger.info(`Settle up: user ${req.user.id} settled ₹${totalSettled} with ${memberId} in group ${id}`);
        res.status(200).json({ message: `Settled up ₹${totalSettled.toFixed(2)} successfully` });

    } catch (err) {
        logger.error(`Settle up error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createGroup, getGroups, addMember, addGroupExpense, getGroupExpenses, markSplitAsPaid, settleUp };