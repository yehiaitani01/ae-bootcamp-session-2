const request = require('supertest');
const { createTestApp } = require('../helpers/test-app');

let app;
let db;

beforeEach(() => {
  ({ app, db } = createTestApp());
});

afterEach(() => {
  db.close();
});

const createItem = async (body = { name: 'Test item' }) => {
  const response = await request(app).post('/api/items').send(body);
  expect(response.status).toBe(201);
  return response.body;
};

const complete = (id) => request(app).patch(`/api/items/${id}`).send({ completed: true });

const listNames = async (query = '') => {
  const response = await request(app).get(`/api/items${query}`);
  return response.body.map((item) => item.name);
};

describe('Items API', () => {
  describe('GET /', () => {
    it('reports that the server is healthy', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok', message: 'Backend server is running' });
    });
  });

  describe('GET /api/items', () => {
    it('returns an empty list when there are no items', async () => {
      const response = await request(app).get('/api/items');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('returns items with the full structure', async () => {
      await createItem({
        name: 'Structured',
        due_date: '2026-04-01',
        priority: 'medium',
        color: 'aqua',
      });

      const response = await request(app).get('/api/items');

      expect(response.body[0]).toEqual({
        id: expect.any(Number),
        name: 'Structured',
        description: '',
        due_date: '2026-04-01',
        priority: 'medium',
        color: 'aqua',
        completed: false,
        position: 1,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });

    it('sorts by default order: incomplete, due date, then priority', async () => {
      await createItem({ name: 'Undated' });
      await createItem({ name: 'Second', due_date: '2026-04-02', priority: 'low' });
      await createItem({ name: 'First', due_date: '2026-04-01' });
      const done = await createItem({ name: 'Done', due_date: '2026-03-01' });
      await complete(done.id);

      expect(await listNames()).toEqual(['First', 'Second', 'Undated', 'Done']);
    });

    it('supports sort and order query parameters', async () => {
      await createItem({ name: 'B' });
      await createItem({ name: 'A' });

      expect(await listNames('?sort=name&order=desc')).toEqual(['B', 'A']);
    });

    it('filters by status, priority, color and search text', async () => {
      await createItem({ name: 'Pay rent', priority: 'high', color: 'coral' });
      await createItem({ name: 'Walk dog', description: 'in the park' });
      const done = await createItem({ name: 'Old task' });
      await complete(done.id);

      expect(await listNames('?status=active')).toEqual(['Pay rent', 'Walk dog']);
      expect(await listNames('?status=completed')).toEqual(['Old task']);
      expect(await listNames('?priority=high')).toEqual(['Pay rent']);
      expect(await listNames('?color=coral')).toEqual(['Pay rent']);
      expect(await listNames('?q=park')).toEqual(['Walk dog']);
    });

    it.each(['status=done', 'sort=bogus', 'order=sideways', 'priority=urgent', 'color=pink'])(
      'returns 400 for invalid query %s',
      async (query) => {
        const response = await request(app).get(`/api/items?${query}`);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      },
    );
  });

  describe('GET /api/items/:id', () => {
    it('returns a single item', async () => {
      const item = await createItem({ name: 'Find me' });

      const response = await request(app).get(`/api/items/${item.id}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Find me');
    });

    it('returns 404 for a missing item', async () => {
      const response = await request(app).get('/api/items/999999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Item not found' });
    });

    it('returns 400 for an invalid id', async () => {
      const response = await request(app).get('/api/items/abc');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Valid item ID is required' });
    });
  });

  describe('POST /api/items', () => {
    it('creates an item with defaults', async () => {
      const response = await request(app).post('/api/items').send({ name: 'Test Item' });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        name: 'Test Item',
        priority: 'none',
        color: null,
        due_date: null,
        completed: false,
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('created_at');
    });

    it('creates an item with all optional fields', async () => {
      const response = await request(app).post('/api/items').send({
        name: 'Full item',
        description: 'Details',
        due_date: '2026-06-15T14:30',
        priority: 'high',
        color: 'lilac',
      });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        description: 'Details',
        due_date: '2026-06-15T14:30',
        priority: 'high',
        color: 'lilac',
      });
    });

    it.each([
      [{}, 'Item name is required'],
      [{ name: '' }, 'Item name is required'],
      [{ name: '   ' }, 'Item name is required'],
      [{ name: 'x', priority: 'urgent' }, 'Priority must be one of: none, low, medium, high'],
      [
        { name: 'x', due_date: 'someday' },
        'Due date must be a valid date (YYYY-MM-DD or YYYY-MM-DDTHH:mm)',
      ],
    ])('returns 400 for invalid body %j', async (body, message) => {
      const response = await request(app).post('/api/items').send(body);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: message });
    });

    it('returns 400 for malformed JSON', async () => {
      const response = await request(app)
        .post('/api/items')
        .set('Content-Type', 'application/json')
        .send('{bad json');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Request body must be valid JSON' });
    });
  });

  describe('PATCH /api/items/:id', () => {
    it('edits fields and marks an item complete', async () => {
      const item = await createItem({ name: 'Before' });

      const response = await request(app).patch(`/api/items/${item.id}`).send({
        name: 'After',
        priority: 'low',
        completed: true,
        due_date: '2026-07-01',
        color: 'leaf',
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        name: 'After',
        priority: 'low',
        completed: true,
        due_date: '2026-07-01',
        color: 'leaf',
      });
    });

    it('clears the due date and color with null', async () => {
      const item = await createItem({ name: 'Clear', due_date: '2026-07-01', color: 'sun' });

      const response = await request(app)
        .patch(`/api/items/${item.id}`)
        .send({ due_date: null, color: null });

      expect(response.body).toMatchObject({ due_date: null, color: null });
    });

    it('returns 400 when there is nothing valid to update', async () => {
      const item = await createItem();

      const response = await request(app).patch(`/api/items/${item.id}`).send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'No valid fields to update' });
    });

    it('returns 400 for an empty name', async () => {
      const item = await createItem();

      const response = await request(app).patch(`/api/items/${item.id}`).send({ name: '' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Item name is required' });
    });

    it('returns 404 for a missing item', async () => {
      const response = await request(app).patch('/api/items/999999').send({ name: 'x' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Item not found' });
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('deletes an existing item', async () => {
      const item = await createItem({ name: 'Item To Be Deleted' });

      const response = await request(app).delete(`/api/items/${item.id}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Item deleted successfully', id: item.id });

      const deleteAgain = await request(app).delete(`/api/items/${item.id}`);
      expect(deleteAgain.status).toBe(404);
      expect(deleteAgain.body).toEqual({ error: 'Item not found' });
    });

    it('returns 404 when the item does not exist', async () => {
      const response = await request(app).delete('/api/items/999999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Item not found' });
    });

    it('returns 400 for an invalid id', async () => {
      const response = await request(app).delete('/api/items/abc');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Valid item ID is required' });
    });
  });

  describe('DELETE /api/items/completed', () => {
    it('removes completed items only', async () => {
      await createItem({ name: 'Keep' });
      const done = await createItem({ name: 'Drop' });
      await complete(done.id);

      const response = await request(app).delete('/api/items/completed');

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(await listNames()).toEqual(['Keep']);
    });
  });

  describe('POST /api/items/reorder', () => {
    it('stores the manual order', async () => {
      const a = await createItem({ name: 'A' });
      const b = await createItem({ name: 'B' });

      const response = await request(app)
        .post('/api/items/reorder')
        .send({ ids: [b.id, a.id] });

      expect(response.status).toBe(200);
      expect(await listNames('?sort=position')).toEqual(['B', 'A']);
    });

    it('returns 400 for an invalid body and 404 for an unknown id', async () => {
      const bad = await request(app).post('/api/items/reorder').send({ ids: [] });
      expect(bad.status).toBe(400);

      const missing = await request(app)
        .post('/api/items/reorder')
        .send({ ids: [999] });
      expect(missing.status).toBe(404);
    });
  });

  describe('POST /api/items/:id/duplicate', () => {
    it('creates a copy of the item', async () => {
      const item = await createItem({ name: 'Original', priority: 'high' });

      const response = await request(app).post(`/api/items/${item.id}/duplicate`);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        name: 'Original (copy)',
        priority: 'high',
        completed: false,
      });
      expect(response.body.id).not.toBe(item.id);
    });

    it('returns 404 for a missing item', async () => {
      const response = await request(app).post('/api/items/999999/duplicate');

      expect(response.status).toBe(404);
    });
  });

  describe('unknown routes', () => {
    it('returns a JSON 404', async () => {
      const response = await request(app).get('/api/nope');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Route not found' });
    });
  });
});
