import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [filter, setFilter] = useState({ type: '', category: '' });
    const [form, setForm] = useState({
        type: 'expense',
        amount: '',
        category: 'Food',
        tags: '',
        notes: '',
        date: new Date().toISOString().split('T')[0]
    });

    const categories = ['Food', 'Transport', 'Rent', 'Entertainment', 'Healthcare', 'Shopping', 'Salary', 'Other'];

    const fetchExpenses = async () => {
        try {
            const params = {};
            if (filter.type) params.type = filter.type;
            if (filter.category) params.category = filter.category;
            const res = await axios.get('/expenses', { params });
            setExpenses(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [filter]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...form,
                tags: form.tags.split(',').map(t => t.trim()).filter(t => t)
            };
            if (editingExpense) {
                await axios.put(`/expenses/${editingExpense._id}`, data);
            } else {
                await axios.post('/expenses', data);
            }
            setShowForm(false);
            setEditingExpense(null);
            setForm({
                type: 'expense',
                amount: '',
                category: 'Food',
                tags: '',
                notes: '',
                date: new Date().toISOString().split('T')[0]
            });
            fetchExpenses();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setForm({
            type: expense.type,
            amount: expense.amount,
            category: expense.category,
            tags: expense.tags.join(', '),
            notes: expense.notes || '',
            date: new Date(expense.date).toISOString().split('T')[0]
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            await axios.delete(`/expenses/${id}`);
            fetchExpenses();
        }
    };

    const handleExport = async () => {
        const res = await axios.get('/export/csv', { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'spendsense_expenses.csv');
        document.body.appendChild(link);
        link.click();
    };

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Expenses & Income</h1>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        Export CSV
                    </button>
                    <button
                        onClick={() => { setShowForm(true); setEditingExpense(null); }}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        + Add New
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4">
                <select
                    value={filter.type}
                    onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                    className="border rounded px-3 py-2"
                >
                    <option value="">All Types</option>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </select>
                <select
                    value={filter.category}
                    onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                    className="border rounded px-3 py-2"
                >
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h3 className="font-semibold text-lg mb-4">
                        {editingExpense ? 'Edit Transaction' : 'Add Transaction'}
                    </h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 mb-1">Type</label>
                            <select
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Amount (₹)</label>
                            <input
                                type="number"
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Category</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Tags (comma separated)</label>
                            <input
                                type="text"
                                value={form.tags}
                                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                                placeholder="e.g. lunch, office"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Notes</label>
                            <input
                                type="text"
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                                placeholder="Optional note"
                            />
                        </div>
                        <div className="col-span-2 flex gap-3">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                            >
                                {editingExpense ? 'Update' : 'Add'}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); setEditingExpense(null); }}
                                className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Expenses List */}
            <div className="bg-white rounded-lg shadow">
                {expenses.length === 0 ? (
                    <p className="p-6 text-gray-500">No transactions found.</p>
                ) : (
                    expenses.map(expense => (
                        <div key={expense._id} className="flex justify-between items-center p-4 border-b last:border-0">
                            <div>
                                <p className="font-medium">{expense.category}
                                    <span className={`ml-2 text-xs px-2 py-1 rounded ${expense.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {expense.type}
                                    </span>
                                </p>
                                <p className="text-gray-500 text-sm">{expense.notes || 'No notes'} • {new Date(expense.date).toLocaleDateString()}</p>
                                {expense.tags.length > 0 && (
                                    <div className="flex gap-1 mt-1">
                                        {expense.tags.map(tag => (
                                            <span key={tag} className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <p className={`font-bold text-lg ${expense.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                    {expense.type === 'income' ? '+' : '-'}₹{expense.amount}
                                </p>
                                <button
                                    onClick={() => handleEdit(expense)}
                                    className="text-blue-600 hover:underline text-sm"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(expense._id)}
                                    className="text-red-600 hover:underline text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Expenses;