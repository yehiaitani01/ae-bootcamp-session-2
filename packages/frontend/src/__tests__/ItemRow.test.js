import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ItemRow from '../components/ItemRow';

const NOW = new Date(2026, 5, 15, 12, 0);

const baseItem = {
  id: 7,
  name: 'Pay rent',
  description: 'Before noon',
  due_date: '2026-06-10',
  priority: 'high',
  color: 'coral',
  completed: 0,
};

const makeHandlers = () => ({
  onToggle: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onDuplicate: jest.fn(),
});

describe('ItemRow', () => {
  it('shows name, notes, due label and priority', () => {
    render(<ItemRow item={baseItem} handlers={makeHandlers()} now={NOW} />);

    expect(screen.getByText('Pay rent')).toBeInTheDocument();
    expect(screen.getByText('Before noon')).toBeInTheDocument();
    expect(screen.getByText('Wed, Jun 10')).toBeInTheDocument();
    expect(screen.getByText('High priority')).toBeInTheDocument();
  });

  it('wires each control to its handler with the item', async () => {
    const handlers = makeHandlers();
    render(<ItemRow item={baseItem} handlers={handlers} now={NOW} />);

    await userEvent.click(screen.getByRole('checkbox', { name: /Pay rent/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Edit Pay rent' }));
    await userEvent.click(screen.getByRole('button', { name: 'Duplicate Pay rent' }));
    await userEvent.click(screen.getByRole('button', { name: 'Delete Pay rent' }));

    expect(handlers.onToggle).toHaveBeenCalledWith(baseItem);
    expect(handlers.onEdit).toHaveBeenCalledWith(baseItem);
    expect(handlers.onDuplicate).toHaveBeenCalledWith(baseItem);
    expect(handlers.onDelete).toHaveBeenCalledWith(baseItem);
  });

  it('reflects the completed state in the checkbox and label', () => {
    render(<ItemRow item={{ ...baseItem, completed: 1 }} handlers={makeHandlers()} now={NOW} />);

    expect(screen.getByRole('checkbox', { name: 'Mark as not done: Pay rent' })).toBeChecked();
  });

  it('omits optional parts when the item has none', () => {
    const bare = { id: 1, name: 'Bare', priority: 'none', completed: 0 };
    render(<ItemRow item={bare} handlers={makeHandlers()} now={NOW} />);

    expect(screen.queryByText(/priority/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Jun/)).not.toBeInTheDocument();
  });
});
