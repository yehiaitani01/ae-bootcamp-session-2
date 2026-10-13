import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import EventAvailableRounded from '@mui/icons-material/EventAvailableRounded';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { addDays, formatFullDate, getDueKey, toDateKey } from '../utils/dates';
import EmptyState from './EmptyState';
import DraggableItemRow from './DraggableItemRow';
import ItemRow from './ItemRow';

export default function DayView({
  items,
  dayKey,
  onDayChange,
  handlers,
  onAdd,
  showNav = true,
  draggable = false,
  now = new Date(),
}) {
  const dayItems = items.filter((item) => getDueKey(item.due_date) === dayKey);
  const todayKey = toDateKey(now);

  return (
    <Box component="section" aria-label="Day view">
      {showNav ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <IconButton aria-label="Previous day" onClick={() => onDayChange(addDays(dayKey, -1))}>
            <ChevronLeftRounded />
          </IconButton>
          <Typography variant="h2" component="h2" sx={{ flex: 1, textAlign: 'center' }}>
            {formatFullDate(dayKey)}
          </Typography>
          <IconButton aria-label="Next day" onClick={() => onDayChange(addDays(dayKey, 1))}>
            <ChevronRightRounded />
          </IconButton>
          <Button onClick={() => onDayChange(todayKey)} disabled={dayKey === todayKey}>
            Today
          </Button>
        </Box>
      ) : (
        <Typography variant="h2" component="h2" sx={{ mb: 1.5 }}>
          {formatFullDate(dayKey)}
        </Typography>
      )}
      {dayItems.length === 0 ? (
        <EmptyState
          icon={<EventAvailableRounded />}
          title="Nothing scheduled"
          message="This day is free."
          actionLabel="Add a task"
          onAction={() => onAdd(dayKey)}
        />
      ) : (
        <Box component="ul" sx={{ display: 'grid', gap: 1, p: 0, m: 0 }}>
          {dayItems.map((item) =>
            draggable && !item.completed ? (
              <DraggableItemRow key={item.id} item={item} handlers={handlers} now={now} />
            ) : (
              <ItemRow key={item.id} item={item} handlers={handlers} now={now} />
            ),
          )}
        </Box>
      )}
    </Box>
  );
}
