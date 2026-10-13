const JSON_HEADERS = { 'Content-Type': 'application/json' };

async function request(path, options = {}) {
  const response = await fetch(path, options);
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error || `Request failed (${response.status})`);
  }
  return body;
}

const sendJson = (method, path, payload) =>
  request(path, { method, headers: JSON_HEADERS, body: JSON.stringify(payload) });

export function buildListQuery({ status, priority, color, q, sort, order }) {
  const params = new URLSearchParams();
  if (status && status !== 'all') {
    params.set('status', status);
  }
  if (priority) {
    params.set('priority', priority);
  }
  if (color) {
    params.set('color', color);
  }
  if (q) {
    params.set('q', q);
  }
  if (sort) {
    params.set('sort', sort);
  }
  if (order) {
    params.set('order', order);
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const itemsApi = {
  list: (filters) => request(`/api/items${buildListQuery(filters)}`),
  create: (values) => sendJson('POST', '/api/items', values),
  update: (id, changes) => sendJson('PATCH', `/api/items/${id}`, changes),
  remove: (id) => request(`/api/items/${id}`, { method: 'DELETE' }),
  removeCompleted: () => request('/api/items/completed', { method: 'DELETE' }),
  reorder: (ids) => sendJson('POST', '/api/items/reorder', { ids }),
  duplicate: (id) => request(`/api/items/${id}/duplicate`, { method: 'POST' }),
};
