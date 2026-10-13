import AddRounded from '@mui/icons-material/AddRounded';
import DarkModeRounded from '@mui/icons-material/DarkModeRounded';
import KeyboardRounded from '@mui/icons-material/KeyboardRounded';
import LightModeRounded from '@mui/icons-material/LightModeRounded';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  IconButton,
  Snackbar,
  ThemeProvider,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useCallback, useMemo, useRef, useState } from 'react';
import CalendarView from './components/CalendarView';
import DayView from './components/DayView';
import FilterBar from './components/FilterBar';
import ItemFormDialog from './components/ItemFormDialog';
import ListView from './components/ListView';
import QuickAdd from './components/QuickAdd';
import ShortcutsDialog from './components/ShortcutsDialog';
import ViewSwitcher from './components/ViewSwitcher';
import { useItems } from './hooks/useItems';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useDebouncedValue, usePreferences } from './hooks/usePreferences';
import { createAppTheme } from './theme';
import {
  buildDueDate,
  formatDayLabel,
  getDueKey,
  getDueTime,
  isOverdue,
  toDateKey,
} from './utils/dates';
import { countItems } from './utils/grouping';

const SNACKBAR_DURATION_MS = 6000;

export default function App() {
  const [preferences, updatePreferences] = usePreferences();
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const mode = preferences.themeMode || (prefersDark ? 'dark' : 'light');
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const { view, sort, order, filters } = preferences;
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const searchRef = useRef(null);

  const {
    items,
    loading,
    error,
    dismissError,
    createItem,
    updateItem,
    removeItem,
    restoreItem,
    duplicateItem,
    clearCompleted,
    reorderItems,
  } = useItems({ ...filters, q: debouncedSearch.trim(), sort, order });

  const [dayKey, setDayKey] = useState(() => toDateKey(new Date()));
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });
  const [dialog, setDialog] = useState({ open: false, item: null, defaults: undefined });
  const [snackbar, setSnackbar] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const counts = useMemo(() => countItems(items, isOverdue), [items]);
  const hasFilters = Boolean(
    debouncedSearch.trim() || filters.status !== 'all' || filters.priority || filters.color,
  );

  const openCreateDialog = useCallback(
    (date) =>
      setDialog({
        open: true,
        item: null,
        defaults: typeof date === 'string' ? { date } : undefined,
      }),
    [],
  );
  const closeDialog = useCallback((previous) => setDialog({ ...previous, open: false }), []);

  const currentDay = view === 'list' ? null : dayKey;

  const handleQuickAdd = (name) => createItem({ name, due_date: currentDay });

  const handleSubmit = (values) =>
    dialog.item ? updateItem(dialog.item.id, values) : createItem(values);

  const handleToggle = (item) =>
    updateItem(item.id, { completed: !item.completed }).catch(() => {});

  const handleDuplicate = (item) =>
    duplicateItem(item.id)
      .then(() => setSnackbar({ message: `Duplicated "${item.name}"` }))
      .catch(() => {});

  const handleDelete = async (item) => {
    try {
      await removeItem(item.id);
    } catch {
      return;
    }
    setSnackbar({
      message: `Deleted "${item.name}"`,
      actionLabel: 'Undo',
      onAction: () => restoreItem(item).catch(() => {}),
    });
  };

  const handleClearCompleted = async () => {
    setConfirmClear(false);
    try {
      const result = await clearCompleted();
      const count = result?.count ?? counts.completed;
      setSnackbar({ message: `Cleared ${count} completed ${count === 1 ? 'task' : 'tasks'}` });
    } catch {
      // The error banner already explains what went wrong.
    }
  };

  const handleReorder = async (orderedIds) => {
    const wasManual = sort === 'position';
    const previous = { sort, order };
    try {
      await reorderItems(wasManual && order === 'desc' ? [...orderedIds].reverse() : orderedIds);
    } catch {
      return;
    }
    if (!wasManual) {
      updatePreferences({ sort: 'position', order: 'asc' });
      setSnackbar({
        message: 'Switched to manual order',
        actionLabel: 'Undo',
        onAction: () => updatePreferences(previous),
      });
    }
  };

  const handleReschedule = async (item, targetDay) => {
    if (getDueKey(item.due_date) === targetDay) {
      return;
    }
    const previousDueDate = item.due_date;
    try {
      await updateItem(item.id, {
        due_date: buildDueDate(targetDay, getDueTime(item.due_date)),
      });
    } catch {
      return;
    }
    setSnackbar({
      message: `Moved "${item.name}" to ${formatDayLabel(targetDay)}`,
      actionLabel: 'Undo',
      onAction: () => updateItem(item.id, { due_date: previousDueDate }).catch(() => {}),
    });
  };

  const handlers = {
    onToggle: handleToggle,
    onEdit: (item) => setDialog({ open: true, item, defaults: undefined }),
    onDelete: handleDelete,
    onDuplicate: handleDuplicate,
  };

  useKeyboardShortcuts({
    n: () => openCreateDialog(),
    '/': () => searchRef.current?.focus(),
    1: () => updatePreferences({ view: 'list' }),
    2: () => updatePreferences({ view: 'day' }),
    3: () => updatePreferences({ view: 'calendar' }),
    t: () => setDayKey(toDateKey(new Date())),
    '?': () => setShortcutsOpen(true),
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 }, pb: { xs: 18, sm: 12 } }}>
        <Box component="header" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h1" component="h1">
              My Tasks
            </Typography>
            <Box
              sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}
              aria-label="Task summary"
            >
              <Chip size="small" label={`${counts.active} active`} />
              <Chip size="small" label={`${counts.completed} completed`} />
              {counts.overdue > 0 && (
                <Chip size="small" color="error" label={`${counts.overdue} overdue`} />
              )}
            </Box>
          </Box>
          <Tooltip title="Keyboard shortcuts">
            <IconButton aria-label="Keyboard shortcuts" onClick={() => setShortcutsOpen(true)}>
              <KeyboardRounded />
            </IconButton>
          </Tooltip>
          <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton
              aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={() => updatePreferences({ themeMode: mode === 'dark' ? 'light' : 'dark' })}
            >
              {mode === 'dark' ? <LightModeRounded /> : <DarkModeRounded />}
            </IconButton>
          </Tooltip>
        </Box>

        {error && (
          <Alert severity="error" onClose={dismissError} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'grid', gap: 2, mb: 3 }}>
          <QuickAdd onAdd={handleQuickAdd} />
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            searchRef={searchRef}
            filters={filters}
            onFilterChange={(changes) => updatePreferences({ filters: { ...filters, ...changes } })}
            sort={sort}
            order={order}
            onSortChange={(next) => updatePreferences({ sort: next })}
            onOrderToggle={() => updatePreferences({ order: order === 'asc' ? 'desc' : 'asc' })}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ViewSwitcher view={view} onChange={(next) => updatePreferences({ view: next })} />
            {counts.completed > 0 && (
              <Button color="inherit" onClick={() => setConfirmClear(true)}>
                Clear completed
              </Button>
            )}
          </Box>
        </Box>

        <Box component="main" aria-busy={loading}>
          {loading ? (
            <Typography color="text.secondary" role="status">
              Loading your tasks…
            </Typography>
          ) : (
            <>
              {view === 'list' && (
                <ListView
                  items={items}
                  handlers={handlers}
                  hasFilters={hasFilters}
                  manualOrder={sort === 'position'}
                  onReorder={handleReorder}
                  onAdd={() => openCreateDialog()}
                />
              )}
              {view === 'day' && (
                <DayView
                  items={items}
                  dayKey={dayKey}
                  onDayChange={setDayKey}
                  handlers={handlers}
                  onAdd={openCreateDialog}
                />
              )}
              {view === 'calendar' && (
                <CalendarView
                  items={items}
                  month={month}
                  onMonthChange={setMonth}
                  selectedDay={dayKey}
                  onSelectDay={setDayKey}
                  handlers={handlers}
                  onAdd={openCreateDialog}
                  onReschedule={handleReschedule}
                />
              )}
            </>
          )}
        </Box>
      </Container>

      <Fab
        color="primary"
        aria-label="Add task"
        onClick={() => openCreateDialog(currentDay || undefined)}
        sx={{
          position: 'fixed',
          right: { xs: 16, sm: 32 },
          bottom: { xs: 88, sm: 32 },
        }}
      >
        <AddRounded />
      </Fab>

      <ItemFormDialog
        open={dialog.open}
        item={dialog.item}
        defaults={dialog.defaults}
        onClose={() => closeDialog(dialog)}
        onSubmit={handleSubmit}
      />

      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      <Dialog open={confirmClear} onClose={() => setConfirmClear(false)}>
        <DialogTitle>Clear completed tasks?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This permanently removes {counts.completed} completed{' '}
            {counts.completed === 1 ? 'task' : 'tasks'}. This can&apos;t be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClear(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleClearCompleted}>
            Clear completed
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={SNACKBAR_DURATION_MS}
        onClose={(event, reason) => reason !== 'clickaway' && setSnackbar(null)}
        message={snackbar?.message}
        action={
          snackbar?.actionLabel && (
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                snackbar.onAction();
                setSnackbar(null);
              }}
            >
              {snackbar.actionLabel}
            </Button>
          )
        }
        sx={{ bottom: { xs: 88, sm: 24 } }}
      />
    </ThemeProvider>
  );
}
