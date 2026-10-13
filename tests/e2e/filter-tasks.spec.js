const { test, expect, createItem } = require('./support/fixtures');

test.describe('Search and filter tasks', () => {
  test('user narrows the list by search, priority and status', async ({ todoPage, request }) => {
    await createItem(request, { name: 'E2E groceries', priority: 'low' });
    await createItem(request, { name: 'E2E taxes', priority: 'high' });
    const done = await createItem(request, { name: 'E2E old chore', priority: 'high' });
    await request.patch(`/api/items/${(await done.json()).id}`, { data: { completed: true } });
    await todoPage.goto();

    await todoPage.search('tax');
    await expect(todoPage.row('E2E taxes')).toBeVisible();
    await expect(todoPage.row('E2E groceries')).toHaveCount(0);

    await todoPage.search('');
    await todoPage.selectFilter('Priority', 'High');
    await expect(todoPage.row('E2E taxes')).toBeVisible();
    await expect(todoPage.row('E2E old chore')).toBeVisible();
    await expect(todoPage.row('E2E groceries')).toHaveCount(0);

    await todoPage.selectFilter('Status', 'Active');
    await expect(todoPage.row('E2E old chore')).toHaveCount(0);
    await expect(todoPage.row('E2E taxes')).toBeVisible();
  });

  test('user sees a helpful message when nothing matches', async ({ todoPage, request, page }) => {
    await createItem(request, { name: 'E2E something' });
    await todoPage.goto();

    await todoPage.search('zzzz-no-match');

    await expect(page.getByText('No matching tasks')).toBeVisible();
  });
});
