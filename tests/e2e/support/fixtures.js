const base = require('@playwright/test');
const { TodoPage } = require('../pages/todo-page');

const clearAllItems = async (request) => {
  const response = await request.get('/api/items');
  const items = await response.json();
  await Promise.all(items.map((item) => request.delete(`/api/items/${item.id}`)));
};

const test = base.test.extend({
  todoPage: async ({ page, request }, use) => {
    await clearAllItems(request);
    await use(new TodoPage(page));
    await clearAllItems(request);
  },
});

const toDateKey = (date) =>
  [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part) => String(part).padStart(2, '0'))
    .join('-');

const daysFromToday = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateKey(date);
};

const createItem = (request, values) => request.post('/api/items', { data: values });

module.exports = { test, expect: base.expect, daysFromToday, createItem };
