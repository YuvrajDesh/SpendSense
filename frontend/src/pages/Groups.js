import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupExpenses, setGroupExpenses] = useState([]);
    const [showAddMember, setShowAddMember] = useState(false);
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [memberEmail, setMemberEmail] = useState('');
    const [form, setForm] = useState({ name: '', description: '' });
    const [expenseForm, setExpenseForm] = useState({
        description: '',
        amount: '',
        splitAmong: []
    });

    const fetchGroups = async () => {
        try {
            const res = await axios.get('/groups');
            setGroups(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchGroupExpenses = async (groupId) => {
        try {
            const res = await axios.get(`/groups/${groupId}/expenses`);
            setGroupExpenses(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        if (selectedGroup) {
            fetchGroupExpenses(selectedGroup._id);
        }
    }, [selectedGroup]);

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/groups', form);
            setShowForm(false);
            setForm({ name: '', description: '' });
            fetchGroups();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/groups/${selectedGroup._id}/members`, { email: memberEmail });
            setShowAddMember(false);
            setMemberEmail('');
            fetchGroups();
        } catch (err) {
            alert(err.response?.data?.message || 'Error adding member');
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/groups/${selectedGroup._id}/expenses`, expenseForm);
            setShowAddExpense(false);
            setExpenseForm({ description: '', amount: '', splitAmong: [] });
            fetchGroupExpenses(selectedGroup._id);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Shared Expense Groups</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + Create Group
                </button>
            </div>

            {/* Create Group Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h3 className="font-semibold text-lg mb-4">Create Group</h3>
                    <form onSubmit={handleCreateGroup} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-gray-700 mb-1">Group Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Description</label>
                            <input
                                type="text"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                                Create
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Groups List */}
                <div className="md:col-span-1">
                    {groups.length === 0 ? (
                        <p className="text-gray-500">No groups yet.</p>
                    ) : (
                        groups.map(group => (
                            <div
                                key={group._id}
                                onClick={() => setSelectedGroup(group)}
                                className={`bg-white p-4 rounded-lg shadow mb-3 cursor-pointer hover:border-blue-500 border-2 ${selectedGroup?._id === group._id ? 'border-blue-500' : 'border-transparent'}`}
                            >
                                <h3 className="font-semibold">{group.name}</h3>
                                <p className="text-gray-500 text-sm">{group.description}</p>
                                <p className="text-gray-400 text-xs mt-1">{group.members.length} members</p>
                            </div>
                        ))
                    )}
                </div>

                {/* Group Details */}
                {selectedGroup && (
                    <div className="md:col-span-2">
                        <div className="bg-white p-6 rounded-lg shadow mb-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-lg">{selectedGroup.name}</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowAddMember(true)}
                                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                    >
                                        + Add Member
                                    </button>
                                    <button
                                        onClick={() => {
                                            setExpenseForm({
                                                description: '',
                                                amount: '',
                                                splitAmong: selectedGroup.members.map(m => m._id)
                                            });
                                            setShowAddExpense(true);
                                        }}
                                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                    >
                                        + Add Expense
                                    </button>
                                </div>
                            </div>

                            {/* Members */}
                            <div className="mb-4">
                                <h4 className="font-medium text-gray-700 mb-2">Members:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedGroup.members.map(member => (
                                        <span key={member._id} className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                                            {member.name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Add Member Form */}
                            {showAddMember && (
                                <form onSubmit={handleAddMember} className="flex gap-3 mb-4">
                                    <input
                                        type="email"
                                        value={memberEmail}
                                        onChange={(e) => setMemberEmail(e.target.value)}
                                        className="flex-1 border rounded px-3 py-2"
                                        placeholder="Enter member email"
                                        required
                                    />
                                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                                        Add
                                    </button>
                                    <button type="button" onClick={() => setShowAddMember(false)} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                                        Cancel
                                    </button>
                                </form>
                            )}

                            {/* Add Expense Form */}
                            {showAddExpense && (
                                <form onSubmit={handleAddExpense} className="flex flex-col gap-3 mb-4">
                                    <input
                                        type="text"
                                        value={expenseForm.description}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                                        className="border rounded px-3 py-2"
                                        placeholder="Description"
                                        required
                                    />
                                    <input
                                        type="number"
                                        value={expenseForm.amount}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                        className="border rounded px-3 py-2"
                                        placeholder="Amount (₹)"
                                        required
                                    />
                                    <div className="flex gap-3">
                                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                            Add Expense
                                        </button>
                                        <button type="button" onClick={() => setShowAddExpense(false)} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Group Expenses */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h4 className="font-semibold text-lg mb-4">Group Expenses</h4>
                            {groupExpenses.length === 0 ? (
                                <p className="text-gray-500">No expenses yet.</p>
                            ) : (
                                groupExpenses.map(expense => (
                                    <div key={expense._id} className="flex justify-between items-center py-3 border-b last:border-0">
                                        <div>
                                            <p className="font-medium">{expense.description}</p>
                                            <p className="text-gray-500 text-sm">
                                                Paid by {expense.paidBy?.name} • Split among {expense.splitAmong?.length} people
                                            </p>
                                            <p className="text-gray-400 text-xs">
                                                ₹{(expense.amount / expense.splitAmong?.length).toFixed(2)} per person
                                            </p>
                                        </div>
                                        <p className="font-bold text-red-600">₹{expense.amount}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Groups;