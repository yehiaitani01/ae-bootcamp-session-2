const { test, expect, createItem, daysFromToday } = require('./support/fixtures');

test.describe('Edit a task', () => {
  test('user renames a task and the change persists after reload', async ({
    todoPage,
    request,
    page,
  }) => {
    await createItem(request, { name: 'E2E original', due_date: daysFromToday(1) });
    await todoPage.goto();

    await todoPage.editTask('E2E original', { name: 'E2E renamed' });

    await expect(todoPage.row('E2E renamed')).toBeVisible();
    await expect(todoPage.row('E2E original')).toHaveCount(0);

    await page.reload();
    await expect(todoPage.row('E2E renamed')).toBeVisible();
  });
});
