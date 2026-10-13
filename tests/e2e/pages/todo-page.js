const { expect } = require('@playwright/test');

class TodoPage {
  constructor(page) {
    this.page = page;
    this.quickAddInput = page.getByRole('textbox', { name: 'Quick add task' });
    this.fab = page.getByRole('button', { name: 'Add task', exact: true });
    this.dialog = page.getByRole('dialog');
    this.searchInput = page.getByRole('textbox', { name: 'Search' });
  }

  async goto() {
    await this.page.goto('/');
    await expect(this.page.getByRole('heading', { name: 'My Tasks' })).toBeVisible();
    await expect(this.page.getByText('Loading your tasks…')).toBeHidden();
  }

  row(name) {
    return this.page.getByTestId('item-row').filter({ hasText: name });
  }

  async visibleTaskOrder() {
    return this.page
      .getByTestId('item-row')
      .evaluateAll((rows) => rows.map((row) => row.querySelector('p').textContent));
  }

  async quickAdd(name) {
    await this.quickAddInput.fill(name);
    await this.quickAddInput.press('Enter');
    await expect(this.row(name)).toBeVisible();
  }

  async addTask({ name, notes, date, time, priority, color }) {
    await this.fab.click();
    await this.dialog.getByRole('textbox', { name: /Task name/ }).fill(name);
    if (notes) {
      await this.dialog.getByRole('textbox', { name: 'Notes' }).fill(notes);
    }
    if (date) {
      await this.dialog.getByLabel('Due date').fill(date);
    }
    if (time) {
      await this.dialog.getByLabel('Time').fill(time);
    }
    if (priority) {
      await this.selectOption(this.dialog.getByLabel('Priority'), priority);
    }
    if (color) {
      await this.dialog.getByRole('radio', { name: color }).click();
    }
    await this.dialog.getByRole('button', { name: 'Add task' }).click();
    await expect(this.dialog).toBeHidden();
  }

  async editTask(currentName, { name }) {
    await this.page.getByRole('button', { name: `Edit ${currentName}` }).click();
    const nameField = this.dialog.getByRole('textbox', { name: /Task name/ });
    await nameField.fill(name);
    await this.dialog.getByRole('button', { name: 'Save changes' }).click();
    await expect(this.dialog).toBeHidden();
  }

  async toggle(name) {
    await this.row(name).getByRole('checkbox').click();
  }

  async remove(name) {
    await this.page.getByRole('button', { name: `Delete ${name}` }).click();
  }

  async undo() {
    await this.page.getByRole('button', { name: 'Undo' }).click();
  }

  async switchView(view) {
    await this.page.getByRole('button', { name: view, exact: true }).click();
  }

  moveHandle(name, suffix = '') {
    return this.page.getByRole('button', { name: `Move ${name}${suffix}` });
  }

  async moveWithKeyboard(name, direction, newPosition) {
    const handle = this.moveHandle(name);
    await handle.focus();
    await this.page.keyboard.press('Space');
    await expect(handle).toHaveAttribute('aria-pressed', 'true');
    await this.page.keyboard.press(direction);
    await expect(this.page.locator('[aria-live="assertive"]')).toContainText(
      `is over position ${newPosition}`,
    );
    await this.page.keyboard.press('Space');
    await expect(handle).not.toHaveAttribute('aria-pressed', 'true');
  }

  async dragTo(source, target) {
    const from = await source.boundingBox();
    const to = await target.boundingBox();
    await this.page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await this.page.mouse.down();
    await this.page.mouse.move(from.x + 20, from.y + 20, { steps: 5 });
    await this.page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 15 });
    await this.page.mouse.up();
  }

  async search(text) {
    await this.searchInput.fill(text);
  }

  async selectOption(select, optionName) {
    await select.click();
    await this.page.getByRole('option', { name: optionName, exact: true }).click();
  }

  async selectFilter(label, optionName) {
    await this.selectOption(this.page.getByLabel(label, { exact: true }), optionName);
  }
}

module.exports = { TodoPage };
