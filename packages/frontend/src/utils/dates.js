const MS_PER_DAY = 86400000;

const pad = (value) => String(value).padStart(2, '0');

export const toDateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const parseDateKey = (key) => {
  const [year, month, day] = key.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const getDueKey = (dueDate) => (dueDate ? dueDate.slice(0, 10) : null);

export const getDueTime = (dueDate) =>
  dueDate && dueDate.length > 10 ? dueDate.slice(11, 16) : null;

export const buildDueDate = (dateKey, time) => {
  if (!dateKey) {
    return null;
  }
  return time ? `${dateKey}T${time}` : dateKey;
};

export const addDays = (key, days) => {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
};

export const diffInDays = (keyA, keyB) =>
  Math.round((parseDateKey(keyA) - parseDateKey(keyB)) / MS_PER_DAY);

const SHORT_DAY = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});
const SHORT_DAY_WITH_YEAR = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});
const FULL_DAY = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});
const MONTH_LABEL = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
const TIME_LABEL = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });

export function formatDayLabel(key, now = new Date()) {
  const offset = diffInDays(key, toDateKey(now));
  if (offset === 0) {
    return 'Today';
  }
  if (offset === 1) {
    return 'Tomorrow';
  }
  if (offset === -1) {
    return 'Yesterday';
  }
  const date = parseDateKey(key);
  const formatter = date.getFullYear() === now.getFullYear() ? SHORT_DAY : SHORT_DAY_WITH_YEAR;
  return formatter.format(date);
}

export const formatFullDate = (key) => FULL_DAY.format(parseDateKey(key));

export const formatMonthLabel = (year, monthIndex) =>
  MONTH_LABEL.format(new Date(year, monthIndex, 1));

export function formatTime(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return TIME_LABEL.format(new Date(2000, 0, 1, hours, minutes));
}

export function formatDueLabel(dueDate, now = new Date()) {
  const key = getDueKey(dueDate);
  if (!key) {
    return '';
  }
  const time = getDueTime(dueDate);
  const day = formatDayLabel(key, now);
  return time ? `${day}, ${formatTime(time)}` : day;
}

export function isOverdue(item, now = new Date()) {
  const key = getDueKey(item.due_date);
  if (item.completed || !key) {
    return false;
  }
  const todayKey = toDateKey(now);
  if (key !== todayKey) {
    return key < todayKey;
  }
  const time = getDueTime(item.due_date);
  return Boolean(time) && time < `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export const isDueToday = (item, now = new Date()) => getDueKey(item.due_date) === toDateKey(now);

export function buildMonthGrid(year, monthIndex) {
  const first = new Date(year, monthIndex, 1);
  const startKey = toDateKey(new Date(year, monthIndex, 1 - first.getDay()));
  const weeks = [];
  for (let week = 0; week < 6; week += 1) {
    const days = [];
    for (let day = 0; day < 7; day += 1) {
      const key = addDays(startKey, week * 7 + day);
      const date = parseDateKey(key);
      days.push({ key, dayOfMonth: date.getDate(), inMonth: date.getMonth() === monthIndex });
    }
    weeks.push(days);
  }
  return weeks;
}

export function shiftMonth({ year, month }, delta) {
  const shifted = new Date(year, month + delta, 1);
  return { year: shifted.getFullYear(), month: shifted.getMonth() };
}
