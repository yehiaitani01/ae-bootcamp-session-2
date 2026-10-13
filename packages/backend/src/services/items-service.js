const { ApiError } = require('../errors');
const { MAX_NAME_LENGTH } = require('../constants');

const PRIORITY_RANK = `CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 WHEN 'low' THEN 2 ELSE 3 END`;

const SORT_EXPRESSIONS = {
  due_date: { expression: 'due_date', nullsLast: true },
  priority: { expression: PRIORITY_RANK },
  created_at: { expression: 'created_at' },
  name: { expression: 'name COLLATE NOCASE' },
  color: { expression: 'color', nullsLast: true },
  position: { expression: 'position' },
};

// Completed items always sink below active ones; remaining ties fall back to
// due date (undated last), then priority, then creation order.
const TIE_BREAKERS = `(due_date IS NULL), due_date ASC, ${PRIORITY_RANK} ASC, created_at ASC, id ASC`;

const toItem = (row) => ({ ...row, completed: Boolean(row.completed) });

function buildOrderBy(sort, order) {
  const { expression, nullsLast } = SORT_EXPRESSIONS[sort];
  const direction = order === 'desc' ? 'DESC' : 'ASC';
  const nullsClause = nullsLast ? `(${expression} IS NULL) ASC, ` : '';
  return `completed ASC, ${nullsClause}${expression} ${direction}, ${TIE_BREAKERS}`;
}

function buildWhere({ status, priority, color, q }) {
  const clauses = [];
  const params = [];

  if (status === 'active') {
    clauses.push('completed = 0');
  } else if (status === 'completed') {
    clauses.push('completed = 1');
  }
  if (priority) {
    clauses.push('priority = ?');
    params.push(priority);
  }
  if (color === 'none') {
    clauses.push('color IS NULL');
  } else if (color) {
    clauses.push('color = ?');
    params.push(color);
  }
  if (q) {
    const pattern = `%${q.replace(/[\\%_]/g, '\\$&')}%`;
    clauses.push(`(name LIKE ? ESCAPE '\\' OR description LIKE ? ESCAPE '\\')`);
    params.push(pattern, pattern);
  }

  return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
}

function createItemsService(db) {
  const getRow = db.prepare('SELECT * FROM items WHERE id = ?');
  const nextPosition = db.prepare('SELECT COALESCE(MAX(position), 0) + 1 AS next FROM items');
  const insertRow = db.prepare(
    `INSERT INTO items (name, description, due_date, priority, color, position)
     VALUES (@name, @description, @due_date, @priority, @color, @position)`,
  );
  const deleteRow = db.prepare('DELETE FROM items WHERE id = ?');
  const deleteCompleted = db.prepare('DELETE FROM items WHERE completed = 1');
  const setPosition = db.prepare('UPDATE items SET position = ? WHERE id = ?');

  function findOrThrow(id) {
    const row = getRow.get(id);
    if (!row) {
      throw new ApiError(404, 'Item not found');
    }
    return row;
  }

  function list(filters) {
    const { where, params } = buildWhere(filters);
    const orderBy = buildOrderBy(filters.sort, filters.order);
    return db
      .prepare(`SELECT * FROM items ${where} ORDER BY ${orderBy}`)
      .all(...params)
      .map(toItem);
  }

  function get(id) {
    return toItem(findOrThrow(id));
  }

  function create(input) {
    const result = insertRow.run({
      description: '',
      due_date: null,
      priority: 'none',
      color: null,
      ...input,
      position: nextPosition.get().next,
    });
    return toItem(getRow.get(result.lastInsertRowid));
  }

  function update(id, changes) {
    findOrThrow(id);
    // Column names come from the validator's fixed field list, never from request keys.
    const assignments = Object.keys(changes).map((field) => `${field} = @${field}`);
    db.prepare(
      `UPDATE items SET ${assignments.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = @id`,
    ).run({ ...changes, id });
    return toItem(getRow.get(id));
  }

  function remove(id) {
    findOrThrow(id);
    deleteRow.run(id);
  }

  function removeCompleted() {
    return deleteCompleted.run().changes;
  }

  function reorder(ids) {
    const apply = db.transaction(() => {
      const slots = ids.map((id) => findOrThrow(id).position).sort((a, b) => a - b);
      ids.forEach((id, index) => setPosition.run(slots[index], id));
    });
    apply();
  }

  function duplicate(id) {
    const source = findOrThrow(id);
    const suffix = ' (copy)';
    return create({
      name: `${source.name.slice(0, MAX_NAME_LENGTH - suffix.length)}${suffix}`,
      description: source.description,
      due_date: source.due_date,
      priority: source.priority,
      color: source.color,
    });
  }

  return { list, get, create, update, remove, removeCompleted, reorder, duplicate };
}

module.exports = { createItemsService };
