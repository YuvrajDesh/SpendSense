const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');

describe('Expense and Budget API', () => {
    let token;
    let userId;

    beforeEach(async () => {
        // Register a user to get a token
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Tester', email: 'tester@example.com', password: 'password123' });
        
        token = res.body.token;
        userId = res.body.user.id;
    });

    describe('Budgets', () => {
        it('should create a new budget', async () => {
            const now = new Date();
            const res = await request(app)
                .post('/api/budgets')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    category: 'Food',
                    limit: 5000,
                    month: now.getMonth() + 1,
                    year: now.getFullYear()
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.category).toBe('Food');
            expect(res.body.limit).toBe(5000);
        });

        it('should get all budgets for a user', async () => {
            const now = new Date();
            await request(app)
                .post('/api/budgets')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    category: 'Food',
                    limit: 5000,
                    month: now.getMonth() + 1,
                    year: now.getFullYear()
                });

            const res = await request(app)
                .get('/api/budgets')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toBe(1);
        });
    });

    describe('Expenses', () => {
        it('should add a new expense', async () => {
            const res = await request(app)
                .post('/api/expenses')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    type: 'expense',
                    amount: 200,
                    category: 'Food',
                    notes: 'Lunch'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.amount).toBe(200);
            expect(res.body.category).toBe('Food');
        });

        it('should trigger a budget breach notification', async () => {
            const now = new Date();
            // 1. Set a small budget
            await request(app)
                .post('/api/budgets')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    category: 'Food',
                    limit: 100,
                    month: now.getMonth() + 1,
                    year: now.getFullYear()
                });

            // 2. Add an expense that exceeds the budget
            await request(app)
                .post('/api/expenses')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    type: 'expense',
                    amount: 150,
                    category: 'Food',
                    notes: 'Expensive Dinner'
                });

            // 3. Check notifications
            const res = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            const breach = res.body.find(n => n.type === 'budget_breach');
            expect(breach).toBeDefined();
            expect(breach.message).toContain('Budget breached for Food');
        });

        it('should trigger a large transaction notification', async () => {
            // 1. Add a large expense (> 10000 based on controller logic)
            await request(app)
                .post('/api/expenses')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    type: 'expense',
                    amount: 12000,
                    category: 'Shopping',
                    notes: 'New Laptop (partial payment)'
                });

            // 2. Check notifications
            const res = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            const largeTx = res.body.find(n => n.type === 'large_transaction');
            expect(largeTx).toBeDefined();
        });
    });
});
