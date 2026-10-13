const { test, expect, daysFromToday } = require('./support/fixtures');

test.describe('Add a task', () => {
  test('user adds a task quickly and with full details', async ({ todoPage, page }) => {
    await todoPage.goto();
    await expect(page.getByText('Nothing to do yet')).toBeVisible();

    await todoPage.quickAdd('E2E quick task');
    await expect(page.getByRole('heading', { name: 'No date (1)' })).toBeVisible();

    await todoPage.addTask({
      name: 'E2E detailed task',
      notes: 'Bring the documents',
      date: daysFromToday(0),
      time: '09:30',
      priority: 'High',
      color: 'Coral',
    });

    const row = todoPage.row('E2E detailed task');
    await expect(row).toContainText('Bring the documents');
    await expect(row).toContainText('Today, 9:30');
    await expect(row).toContainText('High priority');
    await expect(page.getByRole('heading', { name: 'Today (1)' })).toBeVisible();
  });

  test('user is told when the task name is missing', async ({ todoPage }) => {
    await todoPage.goto();
    await todoPage.fab.click();
    await todoPage.dialog.getByRole('button', { name: 'Add task' }).click();

    await expect(todoPage.dialog.getByText('Give your task a name.')).toBeVisible();
  });
});
