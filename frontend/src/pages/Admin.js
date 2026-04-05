import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [activeTab, setActiveTab] = useState('users');
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [usersRes, expensesRes, notificationsRes] = await Promise.all([
                axios.get('/admin/users'),
                axios.get('/admin/expenses'),
                axios.get('/admin/notifications')
            ]);
            setUsers(usersRes.data);
            setExpenses(expensesRes.data);
            setNotifications(notificationsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggleStatus = async (id) => {
        await axios.put(`/admin/users/${id}/toggle`);
        fetchData();
    };

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-6">
                {['users', 'expenses', 'notifications'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded capitalize ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-200'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="bg-white rounded-lg shadow">
                    {users.map(user => (
                        <div key={user._id} className="flex justify-between items-center p-4 border-b last:border-0">
                            <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-gray-500 text-sm">{user.email}</p>
                                <span className={`text-xs px-2 py-1 rounded ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                                    {user.role}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs px-2 py-1 rounded ${user.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {user.isActive ? 'Active' : 'Disabled'}
                                </span>
                                <button
                                    onClick={() => handleToggleStatus(user._id)}
                                    className={`px-3 py-1 rounded text-sm text-white ${user.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                                >
                                    {user.isActive ? 'Disable' : 'Enable'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Expenses Tab */}
            {activeTab === 'expenses' && (
                <div className="bg-white rounded-lg shadow">
                    {expenses.map(expense => (
                        <div key={expense._id} className="flex justify-between items-center p-4 border-b last:border-0">
                            <div>
                                <p className="font-medium">{expense.category}</p>
                                <p className="text-gray-500 text-sm">{expense.user?.name} • {expense.user?.email}</p>
                                <p className="text-gray-400 text-xs">{new Date(expense.date).toLocaleDateString()}</p>
                            </div>
                            <p className={`font-bold ${expense.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {expense.type === 'income' ? '+' : '-'}₹{expense.amount}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                <div className="bg-white rounded-lg shadow">
                    {notifications.map(notification => (
                        <div key={notification._id} className="flex justify-between items-center p-4 border-b last:border-0">
                            <div>
                                <p className="font-medium">{notification.message}</p>
                                <p className="text-gray-500 text-sm">{notification.user?.name} • {notification.user?.email}</p>
                                <p className="text-gray-400 text-xs">{new Date(notification.createdAt).toLocaleString()}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${notification.isRead ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'}`}>
                                {notification.isRead ? 'Read' : 'Unread'}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Admin;