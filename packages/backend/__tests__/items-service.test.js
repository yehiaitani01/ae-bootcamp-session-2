const { createDatabase } = require('../src/db/database');
const { createItemsService } = require('../src/services/items-service');

const defaultFilters = { status: 'all', q: '', sort: 'due_date', order: 'asc' };

let db;
let service;

beforeEach(() => {
  db = createDatabase(':memory:');
  service = createItemsService(db);
});

afterEach(() => {
  db.close();
});

const names = (items) => items.map((item) => item.name);

describe('items service', () => {
  describe('create', () => {
    it('applies defaults and assigns increasing positions', () => {
      const first = service.create({ name: 'First' });
      const second = service.create({ name: 'Second' });

      expect(first).toMatchObject({
        name: 'First',
        description: '',
        due_date: null,
        priority: 'none',
        color: null,
        completed: false,
        position: 1,
      });
      expect(second.position).toBe(2);
    });
  });

  describe('list ordering', () => {
    it('sorts incomplete first, then due date, then priority, then creation order', () => {
      service.create({ name: 'No date' });
      service.create({ name: 'Later low', due_date: '2026-05-02', priority: 'low' });
      service.create({ name: 'Soon', due_date: '2026-05-01' });
      service.create({ name: 'Later high', due_date: '2026-05-02', priority: 'high' });
      const done = service.create({ name: 'Done', due_date: '2026-01-01' });
      service.update(done.id, { completed: 1 });

      expect(names(service.list(defaultFilters))).toEqual([
        'Soon',
        'Later high',
        'Later low',
        'No date',
        'Done',
      ]);
    });

    it('keeps undated items last when sorting by due date descending', () => {
      service.create({ name: 'Undated' });
      service.create({ name: 'Early', due_date: '2026-01-01' });
      service.create({ name: 'Late', due_date: '2026-06-01' });

      expect(names(service.list({ ...defaultFilters, order: 'desc' }))).toEqual([
        'Late',
        'Early',
        'Undated',
      ]);
    });

    it('sorts by priority with the highest first when ascending', () => {
      service.create({ name: 'Low', priority: 'low' });
      service.create({ name: 'High', priority: 'high' });
      service.create({ name: 'None' });

      expect(names(service.list({ ...defaultFilters, sort: 'priority' }))).toEqual([
        'High',
        'Low',
        'None',
      ]);
    });

    it('sorts by name case-insensitively', () => {
      service.create({ name: 'banana' });
      service.create({ name: 'Apple' });
      service.create({ name: 'cherry' });

      expect(names(service.list({ ...defaultFilters, sort: 'name' }))).toEqual([
        'Apple',
        'banana',
        'cherry',
      ]);
    });
  });

  describe('list filtering', () => {
    beforeEach(() => {
      service.create({
        name: 'Write report',
        description: 'quarterly numbers',
        priority: 'high',
        color: 'sky',
      });
      service.create({ name: 'Buy milk', priority: 'low' });
      const done = service.create({ name: 'Call bank', color: 'sky' });
      service.update(done.id, { completed: 1 });
    });

    it('filters by status', () => {
      expect(names(service.list({ ...defaultFilters, status: 'active' }))).toEqual([
        'Write report',
        'Buy milk',
      ]);
      expect(names(service.list({ ...defaultFilters, status: 'completed' }))).toEqual([
        'Call bank',
      ]);
    });

    it('filters by priority and color', () => {
      expect(names(service.list({ ...defaultFilters, priority: 'low' }))).toEqual(['Buy milk']);
      expect(names(service.list({ ...defaultFilters, color: 'sky' }))).toEqual([
        'Write report',
        'Call bank',
      ]);
      expect(names(service.list({ ...defaultFilters, color: 'none' }))).toEqual(['Buy milk']);
    });

    it('searches name and description, escaping wildcards', () => {
      expect(names(service.list({ ...defaultFilters, q: 'quarterly' }))).toEqual(['Write report']);
      expect(names(service.list({ ...defaultFilters, q: 'MILK' }))).toEqual(['Buy milk']);
      expect(service.list({ ...defaultFilters, q: '%' })).toEqual([]);
    });
  });

  describe('update', () => {
    it('changes only the given fields', () => {
      const item = service.create({ name: 'Original', priority: 'low' });
      const updated = service.update(item.id, { name: 'Renamed', completed: 1 });

      expect(updated).toMatchObject({ name: 'Renamed', priority: 'low', completed: true });
    });

    it('throws 404 for a missing item', () => {
      expect(() => service.update(999, { name: 'x' })).toThrow(
        expect.objectContaining({ status: 404 }),
      );
    });
  });

  describe('remove and removeCompleted', () => {
    it('removes one item and throws 404 for a missing one', () => {
      const item = service.create({ name: 'Temp' });
      service.remove(item.id);

      expect(service.list(defaultFilters)).toEqual([]);
      expect(() => service.remove(item.id)).toThrow(expect.objectContaining({ status: 404 }));
    });

    it('removes only completed items and reports the count', () => {
      service.create({ name: 'Keep' });
      const done = service.create({ name: 'Drop' });
      service.update(done.id, { completed: 1 });

      expect(service.removeCompleted()).toBe(1);
      expect(names(service.list(defaultFilters))).toEqual(['Keep']);
    });
  });

  describe('reorder', () => {
    it('applies the manual order when sorting by position', () => {
      const a = service.create({ name: 'A' });
      const b = service.create({ name: 'B' });
      const c = service.create({ name: 'C' });

      service.reorder([c.id, a.id, b.id]);

      expect(names(service.list({ ...defaultFilters, sort: 'position' }))).toEqual(['C', 'A', 'B']);
    });

    it('only reuses the positions of the given items, leaving others in place', () => {
      service.create({ name: 'A' });
      const b = service.create({ name: 'B' });
      service.create({ name: 'C' });
      const d = service.create({ name: 'D' });

      service.reorder([d.id, b.id]);

      expect(names(service.list({ ...defaultFilters, sort: 'position' }))).toEqual([
        'A',
        'D',
        'C',
        'B',
      ]);
    });

    it('rolls back when an id does not exist', () => {
      const a = service.create({ name: 'A' });
      const b = service.create({ name: 'B' });

      expect(() => service.reorder([b.id, a.id, 999])).toThrow(
        expect.objectContaining({ status: 404 }),
      );
      expect(names(service.list({ ...defaultFilters, sort: 'position' }))).toEqual(['A', 'B']);
    });
  });

  describe('duplicate', () => {
    it('copies the item as an incomplete "(copy)"', () => {
      const original = service.create({ name: 'Plan', priority: 'high', color: 'leaf' });
      service.update(original.id, { completed: 1 });
      const copy = service.duplicate(original.id);

      expect(copy).toMatchObject({
        name: 'Plan (copy)',
        priority: 'high',
        color: 'leaf',
        completed: false,
      });
      expect(copy.id).not.toBe(original.id);
    });

    it('keeps long names within the limit', () => {
      const original = service.create({ name: 'x'.repeat(200) });
      expect(service.duplicate(original.id).name).toHaveLength(200);
    });
  });
});
