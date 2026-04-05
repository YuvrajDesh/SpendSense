import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts';
import axios from '../utils/axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const Analytics = () => {
    const [categoryData, setCategoryData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [incomeExpenseData, setIncomeExpenseData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, monthRes, incRes] = await Promise.all([
                    axios.get('/analytics/category-breakdown'),
                    axios.get('/analytics/monthly-trend'),
                    axios.get('/analytics/income-vs-expense')
                ]);

                setCategoryData(catRes.data.map(item => ({
                    name: item._id,
                    value: item.total
                })));

                setMonthlyData(monthRes.data.map(item => ({
                    name: `${item._id.month}/${item._id.year}`,
                    amount: item.total
                })));

                // Process income vs expense data
                const processed = {};
                incRes.data.forEach(item => {
                    const key = `${item._id.month}/${item._id.year}`;
                    if (!processed[key]) processed[key] = { name: key, income: 0, expense: 0 };
                    processed[key][item._id.type] = item.total;
                });
                setIncomeExpenseData(Object.values(processed));

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Analytics</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="font-semibold text-lg mb-4">Spending by Category</h3>
                    {categoryData.length === 0 ? (
                        <p className="text-gray-500">No data available.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ₹${value}`}
                                >
                                    {categoryData.map((_, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Bar Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="font-semibold text-lg mb-4">Monthly Spending</h3>
                    {monthlyData.length === 0 ? (
                        <p className="text-gray-500">No data available.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyData}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="amount" fill="#0088FE" name="Expenses (₹)" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Line Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold text-lg mb-4">Income vs Expense Trend</h3>
                {incomeExpenseData.length === 0 ? (
                    <p className="text-gray-500">No data available.</p>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={incomeExpenseData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="income" stroke="#00C49F" name="Income (₹)" />
                            <Line type="monotone" dataKey="expense" stroke="#FF8042" name="Expense (₹)" />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default Analytics;