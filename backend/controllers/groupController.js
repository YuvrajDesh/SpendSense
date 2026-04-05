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
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if requester is group creator
        if (group.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only group creator can add members' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already a member
        if (group.members.includes(user._id)) {
            return res.status(400).json({ message: 'User is already a member' });
        }

        group.members.push(user._id);
        await group.save();

        // Notify the added user
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

// Add group expense
const addGroupExpense = async (req, res) => {
    try {
        const { description, amount, splitAmong } = req.body;

        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if requester is a member
        if (!group.members.includes(req.user.id)) {
            return res.status(403).json({ message: 'You are not a member of this group' });
        }

        const groupExpense = await GroupExpense.create({
            group: req.params.id,
            paidBy: req.user.id,
            description,
            amount,
            splitAmong
        });

        // Notify all split members
        const splitAmount = (amount / splitAmong.length).toFixed(2);
        await Promise.all(splitAmong.map(async (memberId) => {
            if (memberId !== req.user.id) {
                await Notification.create({
                    user: memberId,
                    message: `You owe ₹${splitAmount} for "${description}" in group ${group.name}`,
                    type: 'group_activity'
                });
            }
        }));

        logger.info(`Group expense added: ${description}, amount: ${amount}, group: ${group.name}`);
        res.status(201).json(groupExpense);

    } catch (err) {
        logger.error(`Add group expense error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get group expenses
const getGroupExpenses = async (req, res) => {
    try {
        const expenses = await GroupExpense.find({ group: req.params.id })
            .populate('paidBy', 'name email')
            .populate('splitAmong', 'name email')
            .sort({ date: -1 });

        res.status(200).json(expenses);

    } catch (err) {
        logger.error(`Get group expenses error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createGroup, getGroups, addMember, addGroupExpense, getGroupExpenses };