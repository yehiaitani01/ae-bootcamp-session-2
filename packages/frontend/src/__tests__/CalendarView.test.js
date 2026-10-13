import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CalendarView from '../components/CalendarView';

const NOW = new Date(2026, 5, 15, 12, 0);
const MONTH = { year: 2026, month: 5 };

const items = [
  { id: 1, name: 'Dentist', due_date: '2026-06-15', color: 'sky', priority: 'none', completed: 0 },
  { id: 2, name: 'Report', due_date: '2026-06-15', color: null, priority: 'high', completed: 0 },
  { id: 3, name: 'Party', due_date: '2026-06-20', color: 'rose', priority: 'none', completed: 0 },
];

const handlers = {
  onToggle: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onDuplicate: jest.fn(),
};

const renderCalendar = (props = {}) =>
  render(
    <CalendarView
      items={items}
      month={MONTH}
      onMonthChange={jest.fn()}
      selectedDay="2026-06-15"
      onSelectDay={jest.fn()}
      handlers={handlers}
      onAdd={jest.fn()}
      now={NOW}
      {...props}
    />,
  );

describe('CalendarView', () => {
  it('shows the month label and a task count per day', () => {
    renderCalendar();

    expect(screen.getByRole('heading', { name: 'June 2026' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2026-06-15, 2 tasks' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2026-06-20, 1 task' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2026-06-16, 0 tasks' })).toBeInTheDocument();
  });

  it('lists the tasks of the selected day below the grid', () => {
    renderCalendar();

    const panel = screen.getByRole('region', { name: 'Day view' });
    expect(within(panel).getByText('Dentist')).toBeInTheDocument();
    expect(within(panel).getByText('Report')).toBeInTheDocument();
    expect(within(panel).queryByText('Party')).not.toBeInTheDocument();
  });

  it('selects a day on click', async () => {
    const onSelectDay = jest.fn();
    renderCalendar({ onSelectDay });

    await userEvent.click(screen.getByRole('button', { name: '2026-06-20, 1 task' }));

    expect(onSelectDay).toHaveBeenCalledWith('2026-06-20');
  });

  it('navigates months', async () => {
    const onMonthChange = jest.fn();
    renderCalendar({ onMonthChange });

    await userEvent.click(screen.getByRole('button', { name: 'Next month' }));
    await userEvent.click(screen.getByRole('button', { name: 'Previous month' }));

    expect(onMonthChange).toHaveBeenNthCalledWith(1, { year: 2026, month: 6 });
    expect(onMonthChange).toHaveBeenNthCalledWith(2, { year: 2026, month: 4 });
  });

  it('shows an empty state for a free day', () => {
    renderCalendar({ selectedDay: '2026-06-16' });

    expect(screen.getByText('Nothing scheduled')).toBeInTheDocument();
  });
});
