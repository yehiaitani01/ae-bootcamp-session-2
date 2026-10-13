import {
  addDays,
  buildDueDate,
  buildMonthGrid,
  diffInDays,
  formatDayLabel,
  formatDueLabel,
  getDueKey,
  getDueTime,
  isOverdue,
  parseDateKey,
  shiftMonth,
  toDateKey,
} from '../utils/dates';

const NOW = new Date(2026, 5, 15, 14, 30);

describe('dates utils', () => {
  describe('toDateKey / parseDateKey', () => {
    it('formats a local date with zero padding', () => {
      expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    });

    it('round-trips a key, ignoring any time portion', () => {
      expect(toDateKey(parseDateKey('2026-03-09T10:00'))).toBe('2026-03-09');
    });
  });

  describe('due date helpers', () => {
    it('splits the date and time of a due date', () => {
      expect(getDueKey('2026-06-15T09:30')).toBe('2026-06-15');
      expect(getDueTime('2026-06-15T09:30')).toBe('09:30');
      expect(getDueTime('2026-06-15')).toBeNull();
      expect(getDueKey(null)).toBeNull();
    });

    it('builds a due date from parts', () => {
      expect(buildDueDate('2026-06-15', '09:30')).toBe('2026-06-15T09:30');
      expect(buildDueDate('2026-06-15', '')).toBe('2026-06-15');
      expect(buildDueDate('', '09:30')).toBeNull();
    });
  });

  describe('addDays / diffInDays', () => {
    it('crosses month and year boundaries', () => {
      expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
      expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    });

    it('counts whole days between keys', () => {
      expect(diffInDays('2026-06-15', '2026-06-10')).toBe(5);
      expect(diffInDays('2026-06-10', '2026-06-15')).toBe(-5);
    });
  });

  describe('formatDayLabel', () => {
    it('uses relative names near today', () => {
      expect(formatDayLabel('2026-06-15', NOW)).toBe('Today');
      expect(formatDayLabel('2026-06-16', NOW)).toBe('Tomorrow');
      expect(formatDayLabel('2026-06-14', NOW)).toBe('Yesterday');
    });

    it('omits the year for the current year only', () => {
      expect(formatDayLabel('2026-07-04', NOW)).toBe('Sat, Jul 4');
      expect(formatDayLabel('2027-07-04', NOW)).toBe('Sun, Jul 4, 2027');
    });
  });

  describe('formatDueLabel', () => {
    it('adds the time when present', () => {
      expect(formatDueLabel('2026-06-15T09:05', NOW)).toMatch(/^Today, 9:05\s?AM$/);
    });

    it('returns an empty string without a due date', () => {
      expect(formatDueLabel(null, NOW)).toBe('');
    });
  });

  describe('isOverdue', () => {
    it('flags past dates that are not completed', () => {
      expect(isOverdue({ due_date: '2026-06-14', completed: 0 }, NOW)).toBe(true);
      expect(isOverdue({ due_date: '2026-06-14', completed: 1 }, NOW)).toBe(false);
    });

    it('does not flag future dates or items without dates', () => {
      expect(isOverdue({ due_date: '2026-06-16', completed: 0 }, NOW)).toBe(false);
      expect(isOverdue({ due_date: null, completed: 0 }, NOW)).toBe(false);
    });

    it('compares the time for items due today', () => {
      expect(isOverdue({ due_date: '2026-06-15T09:00', completed: 0 }, NOW)).toBe(true);
      expect(isOverdue({ due_date: '2026-06-15T18:00', completed: 0 }, NOW)).toBe(false);
      expect(isOverdue({ due_date: '2026-06-15', completed: 0 }, NOW)).toBe(false);
    });
  });

  describe('buildMonthGrid', () => {
    it('always returns six weeks of seven days starting on Sunday', () => {
      const grid = buildMonthGrid(2026, 5);
      expect(grid).toHaveLength(6);
      grid.forEach((week) => expect(week).toHaveLength(7));
      expect(grid[0][0].key).toBe('2026-05-31');
      expect(grid[0][1]).toEqual({ key: '2026-06-01', dayOfMonth: 1, inMonth: true });
    });

    it('marks days outside the month', () => {
      const grid = buildMonthGrid(2026, 5);
      expect(grid[0][0].inMonth).toBe(false);
      expect(grid[5].some((day) => day.inMonth === false)).toBe(true);
    });
  });

  describe('shiftMonth', () => {
    it('wraps across years', () => {
      expect(shiftMonth({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 });
      expect(shiftMonth({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 });
    });
  });
});
