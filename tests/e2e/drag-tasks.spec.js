const { test, expect, createItem, daysFromToday } = require('./support/fixtures');

test.describe('Drag tasks', () => {
  test.use({ viewport: { width: 1280, height: 1200 } });

  test('user reorders tasks with the keyboard and the order is remembered', async ({
    todoPage,
    request,
    page,
  }) => {
    await createItem(request, { name: 'E2E first' });
    await createItem(request, { name: 'E2E second' });
    await createItem(request, { name: 'E2E third' });
    await todoPage.goto();
    await expect
      .poll(() => todoPage.visibleTaskOrder())
      .toEqual(['E2E first', 'E2E second', 'E2E third']);

    await todoPage.moveWithKeyboard('E2E first', 'ArrowDown', '2 of 3');

    await expect
      .poll(() => todoPage.visibleTaskOrder())
      .toEqual(['E2E second', 'E2E first', 'E2E third']);
    await expect(page.getByText('Switched to manual order')).toBeVisible();

    await page.reload();
    await expect
      .poll(() => todoPage.visibleTaskOrder())
      .toEqual(['E2E second', 'E2E first', 'E2E third']);
  });

  test('user drags a task onto another calendar day and the time is kept', async ({
    todoPage,
    request,
    page,
  }) => {
    const today = new Date();
    const offset =
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).getMonth() ===
      today.getMonth()
        ? 1
        : -1;
    const target = daysFromToday(offset);
    const response = await createItem(request, {
      name: 'E2E reschedule me',
      due_date: `${daysFromToday(0)}T09:30`,
    });
    const { id } = await response.json();
    await todoPage.goto();
    await todoPage.switchView('Calendar');

    await todoPage.dragTo(
      todoPage.moveHandle('E2E reschedule me', ' to another day'),
      page.getByRole('button', { name: `${target}, 0 tasks` }),
    );

    await expect(page.getByRole('button', { name: `${target}, 1 task` })).toBeVisible();
    await expect(todoPage.row('E2E reschedule me')).toHaveCount(0);
    const saved = await (await request.get(`/api/items/${id}`)).json();
    expect(saved.due_date).toBe(`${target}T09:30`);

    await todoPage.undo();
    await expect(page.getByRole('button', { name: `${daysFromToday(0)}, 1 task` })).toBeVisible();
  });
});
