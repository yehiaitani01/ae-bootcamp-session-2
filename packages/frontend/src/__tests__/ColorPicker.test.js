import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ColorPicker from '../components/ColorPicker';
import ViewSwitcher from '../components/ViewSwitcher';

describe('ColorPicker', () => {
  it('exposes a radio per color plus "No color" and marks the selection', () => {
    render(<ColorPicker value="coral" onChange={() => {}} />);

    expect(screen.getAllByRole('radio')).toHaveLength(9);
    expect(screen.getByRole('radio', { name: 'Coral' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'No color' })).not.toBeChecked();
  });

  it('reports the chosen color key, or null for none', async () => {
    const onChange = jest.fn();
    render(<ColorPicker value="coral" onChange={onChange} />);

    await userEvent.click(screen.getByRole('radio', { name: 'Sky' }));
    await userEvent.click(screen.getByRole('radio', { name: 'No color' }));

    expect(onChange).toHaveBeenNthCalledWith(1, 'sky');
    expect(onChange).toHaveBeenNthCalledWith(2, null);
  });
});

describe('ViewSwitcher', () => {
  it('shows all views with the current one pressed', () => {
    render(<ViewSwitcher view="day" onChange={() => {}} />);

    expect(screen.getByRole('button', { name: 'Day' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Calendar' })).toBeInTheDocument();
  });

  it('calls onChange with the new view and ignores re-selecting the current one', async () => {
    const onChange = jest.fn();
    render(<ViewSwitcher view="list" onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'List' }));
    expect(onChange).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Calendar' }));
    expect(onChange).toHaveBeenCalledWith('calendar');
  });
});
