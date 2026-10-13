const PRIORITIES = ['none', 'low', 'medium', 'high'];
const COLORS = ['sky', 'aqua', 'leaf', 'sun', 'coral', 'rose', 'lilac', 'slate'];
const STATUSES = ['all', 'active', 'completed'];
const SORT_KEYS = ['due_date', 'priority', 'created_at', 'name', 'color', 'position'];
const MAX_NAME_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;

module.exports = {
  PRIORITIES,
  COLORS,
  STATUSES,
  SORT_KEYS,
  MAX_NAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
};
