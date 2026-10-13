import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ItemFormDialog from '../components/ItemFormDialog';

const renderDialog = (props = {}) => {
  const onSubmit = jest.fn().mockResolvedValue({});
  const onClose = jest.fn();
  render(<ItemFormDialog open onClose={onClose} onSubmit={onSubmit} {...props} />);
  return { onSubmit, onClose };
};

describe('ItemFormDialog', () => {
  it('blocks submit and explains when the name is empty', async () => {
    const { onSubmit } = renderDialog();

    await userEvent.click(screen.getByRole('button', { name: 'Add task' }));

    expect(screen.getByText('Give your task a name.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits trimmed values and closes', async () => {
    const { onSubmit, onClose } = renderDialog();

    await userEvent.type(screen.getByRole('textbox', { name: /Task name/ }), '  Buy milk  ');
    await userEvent.type(screen.getByLabelText('Due date'), '2026-06-20');
    await userEvent.click(screen.getByRole('radio', { name: 'Leaf' }));
    await userEvent.click(screen.getByRole('button', { name: 'Add task' }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Buy milk',
      description: '',
      due_date: '2026-06-20',
      priority: 'none',
      color: 'leaf',
    });
  });

  it('prefills when editing and keeps the time with the date', async () => {
    const item = {
      id: 3,
      name: 'Dentist',
      description: 'Bring forms',
      due_date: '2026-06-20T09:30',
      priority: 'medium',
      color: 'sky',
    };
    const { onSubmit } = renderDialog({ item });

    expect(screen.getByRole('textbox', { name: /Task name/ })).toHaveValue('Dentist');
    expect(screen.getByLabelText('Due date')).toHaveValue('2026-06-20');
    expect(screen.getByLabelText('Time')).toHaveValue('09:30');
    expect(screen.getByRole('radio', { name: 'Sky' })).toBeChecked();

    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Dentist',
          due_date: '2026-06-20T09:30',
          priority: 'medium',
        }),
      ),
    );
  });

  it('applies defaults for a new task', () => {
    renderDialog({ defaults: { date: '2026-07-01' } });

    expect(screen.getByLabelText('Due date')).toHaveValue('2026-07-01');
  });

  it('stays open when the submit fails so input is not lost', async () => {
    const onSubmit = jest.fn().mockRejectedValue(new Error('nope'));
    const onClose = jest.fn();
    render(<ItemFormDialog open onClose={onClose} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByRole('textbox', { name: /Task name/ }), 'Keep me');
    await userEvent.click(screen.getByRole('button', { name: 'Add task' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: /Task name/ })).toHaveValue('Keep me');
  });
});
