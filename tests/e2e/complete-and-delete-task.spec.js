const { test, expect, createItem } = require('./support/fixtures');

test.describe('Complete and delete a task', () => {
  test('user completes a task, deletes it, and undoes the delete', async ({
    todoPage,
    request,
    page,
  }) => {
    await createItem(request, { name: 'E2E finish me' });
    await todoPage.goto();

    await todoPage.toggle('E2E finish me');
    await expect(page.getByRole('heading', { name: 'Completed (1)' })).toBeVisible();
    await expect(page.getByText('1 completed')).toBeVisible();

    await todoPage.remove('E2E finish me');
    await expect(todoPage.row('E2E finish me')).toHaveCount(0);

    await todoPage.undo();
    await expect(todoPage.row('E2E finish me')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Completed (1)' })).toBeVisible();
  });

  test('user clears all completed tasks after confirming', async ({ todoPage, request, page }) => {
    await createItem(request, { name: 'E2E keep me' });
    const done = await createItem(request, { name: 'E2E clear me' });
    await request.patch(`/api/items/${(await done.json()).id}`, { data: { completed: true } });
    await todoPage.goto();

    await page.getByRole('button', { name: 'Clear completed' }).click();
    await todoPage.dialog.getByRole('button', { name: 'Clear completed' }).click();

    await expect(todoPage.row('E2E clear me')).toHaveCount(0);
    await expect(todoPage.row('E2E keep me')).toBeVisible();
  });
});
