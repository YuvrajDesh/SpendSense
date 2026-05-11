const request = require('supertest');
const app = require('../app.js');

// ─── Auth Tests ───────────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {

    it('should register a new user and return a token', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Yuvraj', email: 'yuvraj@test.com', password: 'password123' });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user.email).toBe('yuvraj@test.com');
        expect(res.body.user).not.toHaveProperty('password'); // password must not leak
    });

    it('should return 400 if user already exists', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({ name: 'Yuvraj', email: 'yuvraj@test.com', password: 'password123' });

        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Yuvraj', email: 'yuvraj@test.com', password: 'password123' });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('User already exists');
    });
});

describe('POST /api/auth/login', () => {

    beforeEach(async () => {
        await request(app)
            .post('/api/auth/register')
            .send({ name: 'Yuvraj', email: 'yuvraj@test.com', password: 'password123' });
    });

    it('should login with correct credentials and return a token', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'yuvraj@test.com', password: 'password123' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should return 400 for wrong password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'yuvraj@test.com', password: 'wrongpassword' });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid credentials');
    });

    it('should return 400 for non-existent user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'ghost@test.com', password: 'password123' });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid credentials');
    });
});
