import { formatDayLabel, getDueKey, toDateKey } from './dates';

export function groupItemsByDay(items, now = new Date()) {
  const todayKey = toDateKey(now);
  const overdue = [];
  const undated = [];
  const completed = [];
  const byDay = new Map();

  items.forEach((item) => {
    const key = getDueKey(item.due_date);
    if (item.completed) {
      completed.push(item);
    } else if (!key) {
      undated.push(item);
    } else if (key < todayKey) {
      overdue.push(item);
    } else {
      byDay.set(key, [...(byDay.get(key) || []), item]);
    }
  });

  const groups = [];
  if (overdue.length > 0) {
    groups.push({ id: 'overdue', label: 'Overdue', tone: 'danger', items: overdue });
  }
  [...byDay.keys()].sort().forEach((key) => {
    groups.push({ id: key, label: formatDayLabel(key, now), items: byDay.get(key) });
  });
  if (undated.length > 0) {
    groups.push({ id: 'no-date', label: 'No date', items: undated });
  }
  if (completed.length > 0) {
    groups.push({ id: 'completed', label: 'Completed', items: completed });
  }
  return groups;
}

export function groupItemsManually(items) {
  const active = items.filter((item) => !item.completed);
  const completed = items.filter((item) => item.completed);
  const groups = [];
  if (active.length > 0) {
    groups.push({ id: 'manual', label: 'My order', items: active });
  }
  if (completed.length > 0) {
    groups.push({ id: 'completed', label: 'Completed', items: completed });
  }
  return groups;
}

export function indexItemsByDueDay(items) {
  const index = new Map();
  items.forEach((item) => {
    const key = getDueKey(item.due_date);
    if (key) {
      index.set(key, [...(index.get(key) || []), item]);
    }
  });
  return index;
}

export function countItems(items, isOverdue, now = new Date()) {
  const completed = items.filter((item) => item.completed).length;
  return {
    active: items.length - completed,
    completed,
    overdue: items.filter((item) => isOverdue(item, now)).length,
  };
}
