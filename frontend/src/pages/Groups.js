import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';

const Groups = () => {
    const { user } = useAuth();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupExpenses, setGroupExpenses] = useState([]);
    const [showAddMember, setShowAddMember] = useState(false);
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [memberEmail, setMemberEmail] = useState('');
    const [form, setForm] = useState({ name: '', description: '' });
    const [splitType, setSplitType] = useState('equal');
    const [expenseForm, setExpenseForm] = useState({
        description: '',
        amount: '',
    });
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [unequalSplits, setUnequalSplits] = useState({});
    const [percentageSplits, setPercentageSplits] = useState({});

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

    useEffect(() => { fetchGroups(); }, []);

    useEffect(() => {
        if (selectedGroup) {
            fetchGroupExpenses(selectedGroup._id);
            setSelectedMembers(selectedGroup.members.map(m => m._id));
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
            const res = await axios.get('/groups');
            setGroups(res.data);
            const updated = res.data.find(g => g._id === selectedGroup._id);
            if (updated) setSelectedGroup(updated);
        } catch (err) {
            alert(err.response?.data?.message || 'Error adding member');
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            let splitDetails = [];

            if (splitType === 'equal') {
                splitDetails = selectedMembers;
            } else if (splitType === 'unequal') {
                splitDetails = selectedMembers.map(id => ({
                    userId: id,
                    amount: parseFloat(unequalSplits[id] || 0)
                }));
            } else if (splitType === 'percentage') {
                splitDetails = selectedMembers.map(id => ({
                    userId: id,
                    percentage: parseFloat(percentageSplits[id] || 0)
                }));
            }

            await axios.post(`/groups/${selectedGroup._id}/expenses`, {
                description: expenseForm.description,
                amount: parseFloat(expenseForm.amount),
                splitType,
                splitDetails
            });

            setShowAddExpense(false);
            setExpenseForm({ description: '', amount: '' });
            setSplitType('equal');
            setUnequalSplits({});
            setPercentageSplits({});
            fetchGroupExpenses(selectedGroup._id);
        } catch (err) {
            alert(err.response?.data?.message || 'Error adding expense');
        }
    };

    const handleMarkPaid = async (expenseId, memberId) => {
        try {
            await axios.put(`/groups/${selectedGroup._id}/expenses/${expenseId}/split/${memberId}/pay`);
            fetchGroupExpenses(selectedGroup._id);
        } catch (err) {
            console.error(err);
        }
    };

    const toggleMember = (memberId) => {
        setSelectedMembers(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Shared Expense </h1>
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
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="border rounded px-3 py-2"
                            placeholder="Group Name"
                            required
                        />
                        <input
                            type="text"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="border rounded px-3 py-2"
                            placeholder="Description (optional)"
                        />
                        <div className="flex gap-3">
                            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Create</button>
                            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500">Cancel</button>
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
                                    <button onClick={() => setShowAddMember(true)} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                                        + Add Member
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedMembers(selectedGroup.members.map(m => m._id));
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
                                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Add</button>
                                    <button type="button" onClick={() => setShowAddMember(false)} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Cancel</button>
                                </form>
                            )}

                            {/* Add Expense Form */}
                            {showAddExpense && (
                                <div className="border rounded-lg p-4 mb-4 bg-gray-50">
                                    <h4 className="font-semibold mb-3">Add Group Expense</h4>
                                    <form onSubmit={handleAddExpense} className="flex flex-col gap-3">
                                        <input
                                            type="text"
                                            value={expenseForm.description}
                                            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                                            className="border rounded px-3 py-2"
                                            placeholder="Description (e.g. Team Dinner)"
                                            required
                                        />
                                        <input
                                            type="number"
                                            value={expenseForm.amount}
                                            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                            className="border rounded px-3 py-2"
                                            placeholder="Total Amount (₹)"
                                            required
                                        />

                                        {/* Split Type Selector */}
                                        <div>
                                            <label className="block text-gray-700 mb-2 font-medium">Split Type</label>
                                            <div className="flex gap-3">
                                                {['equal', 'unequal', 'percentage'].map(type => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => setSplitType(type)}
                                                        className={`px-4 py-2 rounded capitalize text-sm ${splitType === type ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-100'}`}
                                                    >
                                                        {type === 'equal' ? '⚖️ Equal' : type === 'unequal' ? '✏️ Unequal' : '% Percentage'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Member Selection */}
                                        <div>
                                            <label className="block text-gray-700 mb-2 font-medium">Select Members to Split With</label>
                                            <div className="flex flex-col gap-2">
                                                {selectedGroup.members.map(member => (
                                                    <div key={member._id} className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedMembers.includes(member._id)}
                                                            onChange={() => toggleMember(member._id)}
                                                            className="w-4 h-4"
                                                        />
                                                        <span className="text-sm font-medium w-24">{member.name}</span>

                                                        {/* Unequal Split Input */}
                                                        {splitType === 'unequal' && selectedMembers.includes(member._id) && (
                                                            <input
                                                                type="number"
                                                                value={unequalSplits[member._id] || ''}
                                                                onChange={(e) => setUnequalSplits({ ...unequalSplits, [member._id]: e.target.value })}
                                                                className="border rounded px-2 py-1 w-28 text-sm"
                                                                placeholder="Amount (₹)"
                                                            />
                                                        )}

                                                        {/* Percentage Split Input */}
                                                        {splitType === 'percentage' && selectedMembers.includes(member._id) && (
                                                            <input
                                                                type="number"
                                                                value={percentageSplits[member._id] || ''}
                                                                onChange={(e) => setPercentageSplits({ ...percentageSplits, [member._id]: e.target.value })}
                                                                className="border rounded px-2 py-1 w-28 text-sm"
                                                                placeholder="Percentage (%)"
                                                            />
                                                        )}

                                                        {/* Equal Split Preview */}
                                                        {splitType === 'equal' && selectedMembers.includes(member._id) && expenseForm.amount && (
                                                            <span className="text-green-600 text-sm">
                                                                ₹{(parseFloat(expenseForm.amount) / selectedMembers.length).toFixed(2)}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                                Add Expense
                                            </button>
                                            <button type="button" onClick={() => setShowAddExpense(false)} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                        {/* Settlement Summary */}
                        <div className="bg-white p-6 rounded-lg shadow mb-4">
                            <h4 className="font-semibold text-lg mb-4">💰 Who Owes Whom</h4>
                            {(() => {
                                const balances = {};

                                groupExpenses.forEach(expense => {
                                    expense.splitDetails?.forEach(split => {
                                        if (!split.isPaid && split.user?._id !== expense.paidBy?._id) {
                                            const owerId = split.user?._id;
                                            const payerId = expense.paidBy?._id;
                                            const owerName = split.user?.name;
                                            const payerName = expense.paidBy?.name;

                                            if (!owerId || !payerId) return;

                                            const key = `${owerId}_${payerId}`;
                                            if (!balances[key]) {
                                                balances[key] = {
                                                    owerId,
                                                    payerId,
                                                    owerName,
                                                    payerName,
                                                    amount: 0
                                                };
                                            }
                                            balances[key].amount += split.amount;
                                        }
                                    });
                                });

                                const balanceList = Object.values(balances);

                                if (balanceList.length === 0) {
                                    return <p className="text-green-600">✅ All settled up!</p>;
                                }

                                return balanceList.map((balance, index) => (
                                    <div key={index} className="flex justify-between items-center py-3 border-b last:border-0">
                                        <div>
                                            <p className="font-medium">
                                                <span className="text-red-600">{balance.owerName}</span>
                                                {' owes '}
                                                <span className="text-green-600">{balance.payerName}</span>
                                            </p>
                                            <p className="text-gray-500 text-sm">Total pending: ₹{balance.amount.toFixed(2)}</p>
                                        </div>
                                        {balance.owerId === user?.id && (
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const res = await axios.post(`/groups/${selectedGroup._id}/settle`, {
                                                            memberId: balance.payerId
                                                        });
                                                        alert(res.data.message);
                                                        fetchGroupExpenses(selectedGroup._id);
                                                    } catch (err) {
                                                        alert(err.response?.data?.message || 'Error settling up');
                                                    }
                                                }}
                                                className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                                            >
                                                Settle Up ₹{balance.amount.toFixed(2)}
                                            </button>
                                        )}
                                    </div>
                                ));
                            })()}
                        </div>
                        {/* Group Expenses */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h4 className="font-semibold text-lg mb-4">Group Expenses</h4>
                            {groupExpenses.length === 0 ? (
                                <p className="text-gray-500">No expenses yet.</p>
                            ) : (
                                groupExpenses.map(expense => (
                                    <div key={expense._id} className="border rounded-lg p-4 mb-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <div>
                                                <p className="font-semibold">{expense.description}</p>
                                                <p className="text-gray-500 text-sm">
                                                    Paid by {expense.paidBy?.name} •
                                                    <span className="ml-1 capitalize bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs">
                                                        {expense.splitType} split
                                                    </span>
                                                </p>
                                            </div>
                                            <p className="font-bold text-red-600 text-lg">₹{expense.amount}</p>
                                        </div>

                                        {/* Split Details */}
                                        <div className="border-t pt-3">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Split Details:</p>
                                            {expense.splitDetails.map(split => (
                                                <div key={split._id} className="flex justify-between items-center py-2 border-b last:border-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm">{split.user?.name}</span>
                                                        <span className="text-xs text-gray-400">({split.percentage}%)</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-medium">₹{split.amount}</span>
                                                        {split.isPaid ? (
                                                            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                                                                ✅ Paid
                                                            </span>
                                                        ) : (
                                                            split.user?._id === user?.id ? (
                                                                <button
                                                                    onClick={() => handleMarkPaid(expense._id, split.user._id)}
                                                                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                                                >
                                                                    Mark as Paid
                                                                </button>
                                                            ) : (
                                                                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                                                    ⏳ Pending
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
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