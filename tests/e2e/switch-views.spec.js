const { test, expect, createItem, daysFromToday } = require('./support/fixtures');

test.describe('Switch between list, day and calendar views', () => {
  test('user sees the same tasks in each view and the choice is remembered', async ({
    todoPage,
    request,
    page,
  }) => {
    await createItem(request, { name: 'E2E today task', due_date: daysFromToday(0) });
    await createItem(request, { name: 'E2E next week', due_date: daysFromToday(7) });
    await todoPage.goto();

    await todoPage.switchView('Day');
    await expect(page.getByRole('region', { name: 'Day view' })).toBeVisible();
    await expect(todoPage.row('E2E today task')).toBeVisible();
    await expect(todoPage.row('E2E next week')).toHaveCount(0);

    await page.getByRole('button', { name: 'Next day' }).click();
    await expect(page.getByText('Nothing scheduled')).toBeVisible();

    await todoPage.switchView('Calendar');
    await expect(page.getByRole('region', { name: 'Calendar view' })).toBeVisible();
    await expect(page.getByRole('button', { name: `${daysFromToday(0)}, 1 task` })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('region', { name: 'Calendar view' })).toBeVisible();

    await todoPage.switchView('List');
    await expect(todoPage.row('E2E today task')).toBeVisible();
    await expect(todoPage.row('E2E next week')).toBeVisible();
  });

  test('user picks a day on the calendar to see its tasks', async ({ todoPage, request, page }) => {
    const target = daysFromToday(0);
    await createItem(request, { name: 'E2E calendar task', due_date: target });
    await todoPage.goto();

    await todoPage.switchView('Calendar');
    await page.getByRole('button', { name: `${target}, 1 task` }).click();

    await expect(todoPage.row('E2E calendar task')).toBeVisible();
  });
});
