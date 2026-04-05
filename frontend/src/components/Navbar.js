import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
            <div className="text-xl font-bold">💸 SpendSense</div>
            <div className="flex gap-6 items-center">
                <Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link>
                <Link to="/expenses" className="hover:text-blue-200">Expenses</Link>
                <Link to="/budgets" className="hover:text-blue-200">Budgets</Link>
                <Link to="/groups" className="hover:text-blue-200">Groups</Link>
                <Link to="/analytics" className="hover:text-blue-200">Analytics</Link>
                <Link to="/notifications" className="hover:text-blue-200">🔔</Link>
                {user?.role === 'admin' && (
                    <Link to="/admin" className="hover:text-blue-200">Admin</Link>
                )}
                <button
                    onClick={handleLogout}
                    className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-blue-100"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;