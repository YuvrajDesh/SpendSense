import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkRead = async (id) => {
        await axios.put(`/notifications/${id}/read`);
        fetchNotifications();
    };

    const handleMarkAllRead = async () => {
        await axios.put('/notifications/read-all');
        fetchNotifications();
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'budget_breach': return 'bg-red-100 text-red-600';
            case 'budget_warning': return 'bg-yellow-100 text-yellow-600';
            case 'large_transaction': return 'bg-orange-100 text-orange-600';
            case 'group_activity': return 'bg-blue-100 text-blue-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Notifications</h1>
                {notifications.some(n => !n.isRead) && (
                    <button
                        onClick={handleMarkAllRead}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Mark All as Read
                    </button>
                )}
            </div>

            <div className="bg-white rounded-lg shadow">
                {notifications.length === 0 ? (
                    <p className="p-6 text-gray-500">No notifications yet.</p>
                ) : (
                    notifications.map(notification => (
                        <div
                            key={notification._id}
                            className={`flex justify-between items-center p-4 border-b last:border-0 ${!notification.isRead ? 'bg-blue-50' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`text-xs px-2 py-1 rounded ${getTypeColor(notification.type)}`}>
                                    {notification.type.replace('_', ' ')}
                                </span>
                                <div>
                                    <p className="font-medium">{notification.message}</p>
                                    <p className="text-gray-400 text-xs">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            {!notification.isRead && (
                                <button
                                    onClick={() => handleMarkRead(notification._id)}
                                    className="text-blue-600 text-sm hover:underline"
                                >
                                    Mark Read
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;