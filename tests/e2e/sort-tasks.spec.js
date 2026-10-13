const { test, expect, createItem, daysFromToday } = require('./support/fixtures');

test.describe('Task ordering', () => {
  test('tasks are ordered by due date, then by priority within a day', async ({
    todoPage,
    request,
  }) => {
    await createItem(request, { name: 'E2E later', due_date: daysFromToday(3), priority: 'high' });
    await createItem(request, { name: 'E2E no date' });
    await createItem(request, {
      name: 'E2E today low',
      due_date: daysFromToday(0),
      priority: 'low',
    });
    await createItem(request, {
      name: 'E2E today high',
      due_date: daysFromToday(0),
      priority: 'high',
    });
    await todoPage.goto();

    await expect
      .poll(() => todoPage.visibleTaskOrder())
      .toEqual(['E2E today high', 'E2E today low', 'E2E later', 'E2E no date']);
  });

  test('user re-sorts by title and flips the direction', async ({ todoPage, request }) => {
    await createItem(request, { name: 'E2E banana' });
    await createItem(request, { name: 'E2E apple' });
    await createItem(request, { name: 'E2E cherry' });
    await todoPage.goto();

    await todoPage.selectFilter('Sort by', 'Title (A-Z)');
    await expect
      .poll(() => todoPage.visibleTaskOrder())
      .toEqual(['E2E apple', 'E2E banana', 'E2E cherry']);

    await todoPage.page.getByRole('button', { name: /Sort direction/ }).click();
    await expect
      .poll(() => todoPage.visibleTaskOrder())
      .toEqual(['E2E cherry', 'E2E banana', 'E2E apple']);
  });
});
