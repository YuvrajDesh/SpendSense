import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [expRes, budRes, notRes] = await Promise.all([
                    axios.get('/expenses'),
                    axios.get('/budgets'),
                    axios.get('/notifications')
                ]);
                setExpenses(expRes.data);
                setBudgets(budRes.data);
                setNotifications(notRes.data.filter(n => !n.isRead));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const totalExpenses = expenses
        .filter(e => e.type === 'expense')
        .reduce((sum, e) => sum + e.amount, 0);

    const totalIncome = expenses
        .filter(e => e.type === 'income')
        .reduce((sum, e) => sum + e.amount, 0);

    const recentTransactions = expenses.slice(0, 5);

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">
                Welcome back, {user?.name}! 👋
            </h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Total Income</h3>
                    <p className="text-2xl font-bold text-green-600">₹{totalIncome}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Total Expenses</h3>
                    <p className="text-2xl font-bold text-red-600">₹{totalExpenses}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Balance</h3>
                    <p className="text-2xl font-bold text-blue-600">₹{totalIncome - totalExpenses}</p>
                </div>
            </div>

            {/* Unread Notifications */}
            {notifications.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg mb-6">
                    <h3 className="font-semibold text-yellow-700 mb-2">
                        🔔 {notifications.length} Unread Notification(s)
                    </h3>
                    {notifications.slice(0, 3).map(n => (
                        <p key={n._id} className="text-yellow-600 text-sm">{n.message}</p>
                    ))}
                    <Link to="/notifications" className="text-yellow-700 text-sm underline mt-2 block">
                        View all
                    </Link>
                </div>
            )}

            {/* Budget Progress */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">Budget Progress</h3>
                    <Link to="/budgets" className="text-blue-600 text-sm hover:underline">View all</Link>
                </div>
                {budgets.length === 0 ? (
                    <p className="text-gray-500">No budgets set. <Link to="/budgets" className="text-blue-600 hover:underline">Set one now</Link></p>
                ) : (
                    budgets.slice(0, 3).map(budget => (
                        <div key={budget._id} className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span>{budget.category}</span>
                                <span>₹{budget.spent} / ₹{budget.limit}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${budget.percentage >= 100 ? 'bg-red-500' : budget.percentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Recent Transactions */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">Recent Transactions</h3>
                    <Link to="/expenses" className="text-blue-600 text-sm hover:underline">View all</Link>
                </div>
                {recentTransactions.length === 0 ? (
                    <p className="text-gray-500">No transactions yet. <Link to="/expenses" className="text-blue-600 hover:underline">Add one</Link></p>
                ) : (
                    recentTransactions.map(expense => (
                        <div key={expense._id} className="flex justify-between items-center py-3 border-b last:border-0">
                            <div>
                                <p className="font-medium">{expense.category}</p>
                                <p className="text-gray-500 text-sm">{expense.notes || 'No notes'}</p>
                            </div>
                            <p className={`font-bold ${expense.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {expense.type === 'income' ? '+' : '-'}₹{expense.amount}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Dashboard;