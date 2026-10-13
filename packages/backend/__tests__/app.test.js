const request = require('supertest');
const { createTestApp } = require('./helpers/test-app');

let app;
let db;

beforeEach(() => {
  ({ app, db } = createTestApp());
});

afterEach(() => {
  db.close();
});

describe('App', () => {
  describe('initialization', () => {
    it('creates an Express app with all middleware configured', () => {
      expect(app).toBeDefined();
      expect(app._router).toBeDefined();
    });
  });

  describe('health check endpoint', () => {
    it('returns 200 with status ok on GET /', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'ok',
        message: 'Backend server is running',
      });
    });
  });

  describe('error handling', () => {
    it('returns 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown-route');

      expect(response.status).toBe(404);
    });

    it('returns 400 for invalid JSON in request body', async () => {
      const response = await request(app)
        .post('/api/items')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
    });
  });

  describe('CORS configuration', () => {
    it('includes CORS headers in responses', async () => {
      const response = await request(app)
        .get('/')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('security middleware', () => {
    it('includes security headers (Helmet)', async () => {
      const response = await request(app).get('/');

      expect(response.headers['x-content-type-options']).toBeDefined();
    });
  });
});
