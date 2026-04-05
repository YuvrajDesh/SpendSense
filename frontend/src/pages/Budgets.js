import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';

const Budgets = () => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        category: 'Food',
        limit: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    const categories = ['Food', 'Transport', 'Rent', 'Entertainment', 'Healthcare', 'Shopping', 'Other'];

    const fetchBudgets = async () => {
        try {
            const res = await axios.get('/budgets');
            setBudgets(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBudgets();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/budgets', form);
            setShowForm(false);
            setForm({
                category: 'Food',
                limit: '',
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear()
            });
            fetchBudgets();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this budget?')) {
            await axios.delete(`/budgets/${id}`);
            fetchBudgets();
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Budget Goals</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + Set Budget
                </button>
            </div>

            {/* Add Budget Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h3 className="font-semibold text-lg mb-4">Set Budget</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
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
                            <label className="block text-gray-700 mb-1">Limit (₹)</label>
                            <input
                                type="number"
                                value={form.limit}
                                onChange={(e) => setForm({ ...form, limit: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Month</label>
                            <select
                                value={form.month}
                                onChange={(e) => setForm({ ...form, month: parseInt(e.target.value) })}
                                className="w-full border rounded px-3 py-2"
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Year</label>
                            <input
                                type="number"
                                value={form.year}
                                onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                        <div className="col-span-2 flex gap-3">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                            >
                                Save Budget
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Budgets List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {budgets.length === 0 ? (
                    <p className="text-gray-500">No budgets set yet.</p>
                ) : (
                    budgets.map(budget => (
                        <div key={budget._id} className="bg-white p-6 rounded-lg shadow">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold text-lg">{budget.category}</h3>
                                <button
                                    onClick={() => handleDelete(budget._id)}
                                    className="text-red-600 hover:underline text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-500">
                                    {new Date(0, budget.month - 1).toLocaleString('default', { month: 'long' })} {budget.year}
                                </span>
                                <span>₹{budget.spent} / ₹{budget.limit}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full ${budget.percentage >= 100 ? 'bg-red-500' : budget.percentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                                />
                            </div>
                            <p className={`text-sm mt-2 ${budget.percentage >= 100 ? 'text-red-600' : budget.percentage >= 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                                {budget.percentage}% used
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Budgets;