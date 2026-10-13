import { isOverdue } from '../utils/dates';
import {
  countItems,
  groupItemsByDay,
  groupItemsManually,
  indexItemsByDueDay,
} from '../utils/grouping';

const NOW = new Date(2026, 5, 15, 12, 0);

const item = (id, due_date, completed = 0) => ({ id, name: `Task ${id}`, due_date, completed });

describe('grouping utils', () => {
  describe('groupItemsByDay', () => {
    it('orders groups: overdue, upcoming days, no date, completed', () => {
      const groups = groupItemsByDay(
        [
          item(1, null),
          item(2, '2026-06-20'),
          item(3, '2026-06-10'),
          item(4, '2026-06-15'),
          item(5, '2026-06-12', 1),
        ],
        NOW,
      );

      expect(groups.map((group) => group.id)).toEqual([
        'overdue',
        '2026-06-15',
        '2026-06-20',
        'no-date',
        'completed',
      ]);
      expect(groups[0]).toMatchObject({ label: 'Overdue', tone: 'danger' });
      expect(groups[1].label).toBe('Today');
    });

    it('keeps the incoming order inside a group', () => {
      const groups = groupItemsByDay([item(2, '2026-06-15'), item(1, '2026-06-15')], NOW);
      expect(groups[0].items.map((entry) => entry.id)).toEqual([2, 1]);
    });

    it('omits empty groups', () => {
      expect(groupItemsByDay([], NOW)).toEqual([]);
    });
  });

  describe('indexItemsByDueDay', () => {
    it('indexes dated items by day and skips undated ones', () => {
      const index = indexItemsByDueDay([
        item(1, '2026-06-15T09:00'),
        item(2, '2026-06-15'),
        item(3, null),
      ]);
      expect(index.get('2026-06-15').map((entry) => entry.id)).toEqual([1, 2]);
      expect(index.size).toBe(1);
    });
  });

  describe('groupItemsManually', () => {
    it('keeps active tasks in the given order in one group, completed last', () => {
      const groups = groupItemsManually([
        item(3, '2026-06-20'),
        item(1, null, 1),
        item(2, '2026-06-10'),
      ]);
      expect(groups.map((group) => group.id)).toEqual(['manual', 'completed']);
      expect(groups[0].items.map((i) => i.id)).toEqual([3, 2]);
      expect(groups[1].items.map((i) => i.id)).toEqual([1]);
    });

    it('omits empty groups', () => {
      expect(groupItemsManually([])).toEqual([]);
    });
  });

  describe('countItems', () => {
    it('counts active, completed and overdue items', () => {
      const counts = countItems(
        [item(1, '2026-06-01'), item(2, '2026-06-01', 1), item(3, null)],
        isOverdue,
        NOW,
      );
      expect(counts).toEqual({ active: 2, completed: 1, overdue: 1 });
    });
  });
});
