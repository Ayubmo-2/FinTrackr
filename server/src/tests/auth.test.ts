import request from 'supertest';
import app from '../app';

describe('Auth endpoints', () => {
  it('POST /api/auth/register - returns 400 on weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'weak' });
    expect(res.status).toBe(400);
  });

  it('POST /api/auth/login - returns 401 on wrong credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'Test1234!' });
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/refresh - returns 401 with no cookie', async () => {
    const res = await request(app).post('/api/auth/refresh');
    expect(res.status).toBe(401);
  });
});
