export const TASK_COLORS = [
  { key: 'sky', label: 'Sky', hex: '#4FB3F6' },
  { key: 'aqua', label: 'Aqua', hex: '#3DD6B5' },
  { key: 'leaf', label: 'Leaf', hex: '#8BD450' },
  { key: 'sun', label: 'Sun', hex: '#FFD24D' },
  { key: 'coral', label: 'Coral', hex: '#FF8A65' },
  { key: 'rose', label: 'Rose', hex: '#F0729A' },
  { key: 'lilac', label: 'Lilac', hex: '#A58BF0' },
  { key: 'slate', label: 'Slate', hex: '#8DA2B5' },
];

export const COLOR_HEX = Object.fromEntries(TASK_COLORS.map(({ key, hex }) => [key, hex]));

export const PRIORITIES = [
  { value: 'none', label: 'None', color: '#4F6D85' },
  { value: 'low', label: 'Low', color: '#1C8F78' },
  { value: 'medium', label: 'Medium', color: '#C97A00' },
  { value: 'high', label: 'High', color: '#D8364F' },
];

export const PRIORITY_BY_VALUE = Object.fromEntries(PRIORITIES.map((p) => [p.value, p]));

export const SORT_OPTIONS = [
  { value: 'due_date', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
  { value: 'created_at', label: 'Date created' },
  { value: 'name', label: 'Title (A-Z)' },
  { value: 'color', label: 'Color' },
  { value: 'position', label: 'Manual order' },
];

export const VIEWS = [
  { value: 'list', label: 'List' },
  { value: 'day', label: 'Day' },
  { value: 'calendar', label: 'Calendar' },
];

export const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

export const DEFAULT_PREFERENCES = {
  view: 'list',
  sort: 'due_date',
  order: 'asc',
  filters: { status: 'all', priority: '', color: '' },
  themeMode: null,
};

export const MAX_NAME_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 2000;
