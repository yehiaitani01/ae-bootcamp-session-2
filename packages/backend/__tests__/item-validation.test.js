const {
  parseId,
  validateCreateInput,
  validateUpdateInput,
  validateListQuery,
  validateReorderInput,
} = require('../src/validation/item-validation');

const expectBadRequest = (fn, message) => {
  expect(fn).toThrow(expect.objectContaining({ status: 400, message }));
};

describe('parseId', () => {
  it('accepts numeric strings and numbers', () => {
    expect(parseId('12')).toBe(12);
    expect(parseId(7)).toBe(7);
  });

  it.each(['abc', '-1', '1.5', '', undefined, null])('rejects %p', (value) => {
    expectBadRequest(() => parseId(value), 'Valid item ID is required');
  });
});

describe('validateCreateInput', () => {
  it('trims the name and applies only provided optional fields', () => {
    expect(validateCreateInput({ name: '  Buy milk  ' })).toEqual({ name: 'Buy milk' });
  });

  it('accepts all optional fields', () => {
    const input = validateCreateInput({
      name: 'Report',
      description: ' Quarterly ',
      due_date: '2026-03-01T09:30',
      priority: 'high',
      color: 'sky',
    });
    expect(input).toEqual({
      name: 'Report',
      description: 'Quarterly',
      due_date: '2026-03-01T09:30',
      priority: 'high',
      color: 'sky',
    });
  });

  it.each([undefined, '', '   ', 5])('rejects name %p', (name) => {
    expectBadRequest(() => validateCreateInput({ name }), 'Item name is required');
  });

  it('rejects names over the maximum length', () => {
    expectBadRequest(
      () => validateCreateInput({ name: 'a'.repeat(201) }),
      'Item name must be 200 characters or fewer',
    );
  });

  it.each(['2026-13-01', '2026-02-30', 'tomorrow', '2026-03-01 10:00', 20260301])(
    'rejects due date %p',
    (dueDate) => {
      expect(() => validateCreateInput({ name: 'x', due_date: dueDate })).toThrow(
        expect.objectContaining({ status: 400 }),
      );
    },
  );

  it('rejects unknown priority and color values', () => {
    expectBadRequest(
      () => validateCreateInput({ name: 'x', priority: 'urgent' }),
      'Priority must be one of: none, low, medium, high',
    );
    expect(() => validateCreateInput({ name: 'x', color: 'pink' })).toThrow(
      expect.objectContaining({ status: 400 }),
    );
  });

  it('treats null color and due date as cleared values', () => {
    expect(validateCreateInput({ name: 'x', color: null, due_date: null })).toEqual({
      name: 'x',
      color: null,
      due_date: null,
    });
  });
});

describe('validateUpdateInput', () => {
  it('returns only the provided, validated fields', () => {
    expect(validateUpdateInput({ completed: true, priority: 'low' })).toEqual({
      completed: 1,
      priority: 'low',
    });
  });

  it('rejects empty updates', () => {
    expectBadRequest(() => validateUpdateInput({}), 'No valid fields to update');
    expectBadRequest(() => validateUpdateInput({ unknown: 1 }), 'No valid fields to update');
  });

  it('rejects a non-boolean completed value', () => {
    expectBadRequest(
      () => validateUpdateInput({ completed: 'yes' }),
      'Completed must be true or false',
    );
  });

  it('rejects an empty name', () => {
    expectBadRequest(() => validateUpdateInput({ name: ' ' }), 'Item name is required');
  });
});

describe('validateListQuery', () => {
  it('applies defaults', () => {
    expect(validateListQuery({})).toEqual({
      status: 'all',
      priority: undefined,
      color: undefined,
      q: '',
      sort: 'due_date',
      order: 'asc',
    });
  });

  it.each([
    { status: 'done' },
    { sort: 'bogus' },
    { order: 'up' },
    { priority: 'x' },
    { color: 'pink' },
  ])('rejects invalid query %j', (query) => {
    expect(() => validateListQuery(query)).toThrow(expect.objectContaining({ status: 400 }));
  });

  it('accepts the "none" color filter', () => {
    expect(validateListQuery({ color: 'none' }).color).toBe('none');
  });
});

describe('validateReorderInput', () => {
  it('returns parsed ids', () => {
    expect(validateReorderInput({ ids: [3, '1', 2] })).toEqual([3, 1, 2]);
  });

  it.each([undefined, [], 'abc', [1, 1], [1, 'x']])('rejects %p', (ids) => {
    expect(() => validateReorderInput({ ids })).toThrow(expect.objectContaining({ status: 400 }));
  });
});
