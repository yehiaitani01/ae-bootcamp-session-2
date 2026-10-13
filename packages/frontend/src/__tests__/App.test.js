import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';
import { toDateKey } from '../utils/dates';

const today = toDateKey(new Date());

let store;
let nextId;

const seed = () => [
  {
    id: 1,
    name: 'Write report',
    description: '',
    due_date: today,
    priority: 'high',
    color: 'sky',
    completed: 0,
  },
  {
    id: 2,
    name: 'Buy milk',
    description: '',
    due_date: null,
    priority: 'none',
    color: null,
    completed: 0,
  },
];

const server = setupServer(
  rest.get('/api/items', (req, res, ctx) => res(ctx.json(store))),
  rest.post('/api/items', async (req, res, ctx) => {
    const body = await req.json();
    const item = {
      description: '',
      due_date: null,
      priority: 'none',
      color: null,
      completed: 0,
      ...body,
      id: nextId,
    };
    nextId += 1;
    store = [...store, item];
    return res(ctx.status(201), ctx.json(item));
  }),
  rest.patch('/api/items/:id', async (req, res, ctx) => {
    const changes = await req.json();
    const id = Number(req.params.id);
    store = store.map((item) =>
      item.id === id
        ? { ...item, ...changes, completed: Number(changes.completed ?? item.completed) }
        : item,
    );
    return res(ctx.json(store.find((item) => item.id === id)));
  }),
  rest.delete('/api/items/completed', (req, res, ctx) => {
    const count = store.filter((item) => item.completed).length;
    store = store.filter((item) => !item.completed);
    return res(ctx.json({ message: 'Completed items deleted successfully', count }));
  }),
  rest.delete('/api/items/:id', (req, res, ctx) => {
    const id = Number(req.params.id);
    store = store.filter((item) => item.id !== id);
    return res(ctx.json({ message: 'Item deleted successfully', id }));
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  window.localStorage.clear();
});
afterAll(() => server.close());

beforeEach(() => {
  store = seed();
  nextId = 100;
});

const renderApp = async () => {
  render(<App />);
  await screen.findByText('Write report');
};

describe('App', () => {
  it('lists tasks grouped by day with a summary', async () => {
    await renderApp();

    expect(screen.getByRole('heading', { name: 'Today (1)' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'No date (1)' })).toBeInTheDocument();
    expect(screen.getByText('2 active')).toBeInTheDocument();
  });

  it('shows the empty state when there are no tasks', async () => {
    store = [];
    render(<App />);

    expect(await screen.findByText('Nothing to do yet')).toBeInTheDocument();
  });

  it('shows an error banner when loading fails', async () => {
    server.use(
      rest.get('/api/items', (req, res, ctx) => res(ctx.status(500), ctx.json({ error: 'boom' }))),
    );
    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't load your tasks. boom");
  });

  it('adds a task from quick add', async () => {
    await renderApp();

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Quick add task' }),
      'Call mom{Enter}',
    );

    expect(await screen.findByText('Call mom')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Quick add task' })).toHaveValue('');
  });

  it('adds a task with details from the dialog', async () => {
    await renderApp();

    await userEvent.click(screen.getByRole('button', { name: 'Add task' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.type(within(dialog).getByRole('textbox', { name: /Task name/ }), 'Plan trip');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Add task' }));

    expect(await screen.findByText('Plan trip')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('edits a task', async () => {
    await renderApp();

    await userEvent.click(screen.getByRole('button', { name: 'Edit Buy milk' }));
    const dialog = await screen.findByRole('dialog');
    const name = within(dialog).getByRole('textbox', { name: /Task name/ });
    await userEvent.clear(name);
    await userEvent.type(name, 'Buy oat milk');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Buy oat milk')).toBeInTheDocument();
    expect(screen.queryByText('Buy milk')).not.toBeInTheDocument();
  });

  it('completes a task and moves it to the Completed group', async () => {
    await renderApp();

    await userEvent.click(screen.getByRole('checkbox', { name: 'Mark as done: Buy milk' }));

    expect(await screen.findByRole('heading', { name: 'Completed (1)' })).toBeInTheDocument();
    expect(screen.getByText('1 completed')).toBeInTheDocument();
  });

  it('deletes a task and can undo it', async () => {
    await renderApp();

    await userEvent.click(screen.getByRole('button', { name: 'Delete Buy milk' }));
    await waitFor(() => expect(screen.queryByText('Buy milk')).not.toBeInTheDocument());

    await userEvent.click(await screen.findByRole('button', { name: 'Undo' }));

    expect(await screen.findByText('Buy milk')).toBeInTheDocument();
  });

  it('clears completed tasks only after confirmation', async () => {
    store = store.map((item) => (item.id === 2 ? { ...item, completed: 1 } : item));
    await renderApp();

    await userEvent.click(screen.getByRole('button', { name: 'Clear completed' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/permanently removes 1 completed task/)).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Clear completed' }));

    await waitFor(() => expect(screen.queryByText('Buy milk')).not.toBeInTheDocument());
    expect(screen.getByText('Write report')).toBeInTheDocument();
  });

  it('switches between list, day and calendar views and remembers the choice', async () => {
    await renderApp();

    await userEvent.click(screen.getByRole('button', { name: 'Day' }));
    expect(screen.getByRole('region', { name: 'Day view' })).toBeInTheDocument();
    expect(screen.getByText('Write report')).toBeInTheDocument();
    expect(screen.queryByText('Buy milk')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Calendar' }));
    expect(screen.getByRole('region', { name: 'Calendar view' })).toBeInTheDocument();

    expect(JSON.parse(window.localStorage.getItem('todo-app.preferences')).view).toBe('calendar');
  });

  it('switches views with keyboard shortcuts', async () => {
    await renderApp();

    await userEvent.keyboard('3');

    expect(screen.getByRole('region', { name: 'Calendar view' })).toBeInTheDocument();
  });

  it('keeps the dialog usable when a save fails', async () => {
    await renderApp();
    server.use(
      rest.post('/api/items', (req, res, ctx) =>
        res(ctx.status(400), ctx.json({ error: 'Name too long' })),
      ),
    );

    await userEvent.click(screen.getByRole('button', { name: 'Add task' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.type(within(dialog).getByRole('textbox', { name: /Task name/ }), 'X');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Add task' }));

    expect(await screen.findByText(/Couldn't save your task. Name too long/)).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
