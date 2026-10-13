const {
  PRIORITIES,
  COLORS,
  STATUSES,
  SORT_KEYS,
  MAX_NAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
} = require('../constants');
const { ApiError } = require('../errors');

const DUE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?$/;

const badRequest = (message) => new ApiError(400, message);

function parseId(value) {
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw badRequest('Valid item ID is required');
  }
  if (!/^\d+$/.test(String(value))) {
    throw badRequest('Valid item ID is required');
  }
  return Number(value);
}

function validateName(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw badRequest('Item name is required');
  }
  const name = value.trim();
  if (name.length > MAX_NAME_LENGTH) {
    throw badRequest(`Item name must be ${MAX_NAME_LENGTH} characters or fewer`);
  }
  return name;
}

function validateDescription(value) {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value !== 'string' || value.length > MAX_DESCRIPTION_LENGTH) {
    throw badRequest(`Description must be text of ${MAX_DESCRIPTION_LENGTH} characters or fewer`);
  }
  return value.trim();
}

function validateDueDate(value) {
  if (value === null || value === '') {
    return null;
  }
  const isValid =
    typeof value === 'string' &&
    DUE_DATE_PATTERN.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(`${value.slice(0, 10)}T00:00:00Z`).toISOString().slice(0, 10) === value.slice(0, 10);
  if (!isValid) {
    throw badRequest('Due date must be a valid date (YYYY-MM-DD or YYYY-MM-DDTHH:mm)');
  }
  return value;
}

function validatePriority(value) {
  if (!PRIORITIES.includes(value)) {
    throw badRequest(`Priority must be one of: ${PRIORITIES.join(', ')}`);
  }
  return value;
}

function validateColor(value) {
  if (value === null || value === '') {
    return null;
  }
  if (!COLORS.includes(value)) {
    throw badRequest(`Color must be one of: ${COLORS.join(', ')}`);
  }
  return value;
}

function validateCompleted(value) {
  if (typeof value !== 'boolean') {
    throw badRequest('Completed must be true or false');
  }
  return value ? 1 : 0;
}

const FIELD_VALIDATORS = {
  name: validateName,
  description: validateDescription,
  due_date: validateDueDate,
  priority: validatePriority,
  color: validateColor,
  completed: validateCompleted,
};

function validateCreateInput(body = {}) {
  const input = { name: validateName(body.name) };
  Object.keys(FIELD_VALIDATORS)
    .filter((field) => field !== 'name' && field !== 'completed' && body[field] !== undefined)
    .forEach((field) => {
      input[field] = FIELD_VALIDATORS[field](body[field]);
    });
  return input;
}

function validateUpdateInput(body = {}) {
  const input = {};
  Object.keys(FIELD_VALIDATORS)
    .filter((field) => body[field] !== undefined)
    .forEach((field) => {
      input[field] = FIELD_VALIDATORS[field](body[field]);
    });
  if (Object.keys(input).length === 0) {
    throw badRequest('No valid fields to update');
  }
  return input;
}

function validateListQuery(query = {}) {
  const { status = 'all', priority, color, q, sort = 'due_date', order = 'asc' } = query;

  if (!STATUSES.includes(status)) {
    throw badRequest(`Status must be one of: ${STATUSES.join(', ')}`);
  }
  if (priority !== undefined) {
    validatePriority(priority);
  }
  if (color !== undefined && color !== 'none') {
    validateColor(color);
  }
  if (!SORT_KEYS.includes(sort)) {
    throw badRequest(`Sort must be one of: ${SORT_KEYS.join(', ')}`);
  }
  if (order !== 'asc' && order !== 'desc') {
    throw badRequest('Order must be asc or desc');
  }
  if (q !== undefined && typeof q !== 'string') {
    throw badRequest('Search query must be text');
  }

  return { status, priority, color, q: q ? q.trim() : '', sort, order };
}

function validateReorderInput(body = {}) {
  const { ids } = body;
  if (!Array.isArray(ids) || ids.length === 0) {
    throw badRequest('ids must be a non-empty array of item IDs');
  }
  const parsed = ids.map(parseId);
  if (new Set(parsed).size !== parsed.length) {
    throw badRequest('ids must not contain duplicates');
  }
  return parsed;
}

module.exports = {
  parseId,
  validateCreateInput,
  validateUpdateInput,
  validateListQuery,
  validateReorderInput,
};
