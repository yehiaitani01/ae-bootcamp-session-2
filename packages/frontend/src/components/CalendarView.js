import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Box, Button, ButtonBase, IconButton, Paper, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { COLOR_HEX } from '../constants';
import {
  buildMonthGrid,
  formatMonthLabel,
  parseDateKey,
  shiftMonth,
  toDateKey,
} from '../utils/dates';
import { indexItemsByDueDay } from '../utils/grouping';
import DayView from './DayView';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MAX_DOTS = 3;

function DayCell({ day, items, selected, isToday, onSelect }) {
  const { setNodeRef, isOver } = useDroppable({ id: `day:${day.key}` });
  const label = `${day.key}, ${items.length} ${items.length === 1 ? 'task' : 'tasks'}`;
  return (
    <ButtonBase
      ref={setNodeRef}
      onClick={() => onSelect(day.key)}
      aria-label={label}
      aria-pressed={selected}
      data-testid="calendar-day"
      sx={{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        minHeight: 64,
        p: 0.5,
        borderRadius: 2,
        opacity: day.inMonth ? 1 : 0.45,
        border: '2px solid',
        borderColor: selected || isOver ? 'primary.main' : 'transparent',
        bgcolor: isOver ? 'action.hover' : selected ? 'action.selected' : 'transparent',
        borderStyle: isOver ? 'dashed' : 'solid',
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
          fontWeight: 600,
          bgcolor: isToday ? 'primary.main' : 'transparent',
          color: isToday ? 'primary.contrastText' : 'text.primary',
        }}
      >
        {day.dayOfMonth}
      </Box>
      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
        {items.slice(0, MAX_DOTS).map((item) => (
          <Box
            key={item.id}
            aria-hidden
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: COLOR_HEX[item.color] || 'text.secondary',
              opacity: item.completed ? 0.4 : 1,
            }}
          />
        ))}
        {items.length > MAX_DOTS && (
          <Typography variant="caption" aria-hidden sx={{ lineHeight: '8px' }}>
            +{items.length - MAX_DOTS}
          </Typography>
        )}
      </Box>
    </ButtonBase>
  );
}

export default function CalendarView({
  items,
  month,
  onMonthChange,
  selectedDay,
  onSelectDay,
  handlers,
  onAdd,
  onReschedule,
  now = new Date(),
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );
  const [draggedItem, setDraggedItem] = useState(null);
  const grid = useMemo(() => buildMonthGrid(month.year, month.month), [month]);
  const itemsByDay = useMemo(() => indexItemsByDueDay(items), [items]);
  const todayKey = toDateKey(now);
  const todayMonth = { year: now.getFullYear(), month: now.getMonth() };

  const handleSelect = (key) => {
    const date = parseDateKey(key);
    onSelectDay(key);
    if (date.getMonth() !== month.month || date.getFullYear() !== month.year) {
      onMonthChange({ year: date.getFullYear(), month: date.getMonth() });
    }
  };

  const handleDragStart = ({ active }) =>
    setDraggedItem(items.find((item) => item.id === active.id) || null);

  const handleDragEnd = ({ active, over }) => {
    setDraggedItem(null);
    const item = items.find((candidate) => candidate.id === active.id);
    if (!item || !over || !String(over.id).startsWith('day:')) {
      return;
    }
    onReschedule(item, String(over.id).slice('day:'.length));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDraggedItem(null)}
    >
      <Box component="section" aria-label="Calendar view">
        <Paper sx={{ p: { xs: 1, sm: 2 }, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <IconButton
              aria-label="Previous month"
              onClick={() => onMonthChange(shiftMonth(month, -1))}
            >
              <ChevronLeftRounded />
            </IconButton>
            <Typography variant="h2" component="h2" sx={{ flex: 1, textAlign: 'center' }}>
              {formatMonthLabel(month.year, month.month)}
            </Typography>
            <IconButton aria-label="Next month" onClick={() => onMonthChange(shiftMonth(month, 1))}>
              <ChevronRightRounded />
            </IconButton>
            <Button
              onClick={() => {
                onMonthChange(todayMonth);
                onSelectDay(todayKey);
              }}
            >
              Today
            </Button>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
            {WEEKDAYS.map((weekday) => (
              <Typography key={weekday} variant="caption" align="center" color="text.secondary">
                {weekday}
              </Typography>
            ))}
            {grid.flat().map((day) => (
              <DayCell
                key={day.key}
                day={day}
                items={itemsByDay.get(day.key) || []}
                selected={day.key === selectedDay}
                isToday={day.key === todayKey}
                onSelect={handleSelect}
              />
            ))}
          </Box>
        </Paper>
        <DayView
          items={items}
          dayKey={selectedDay}
          handlers={handlers}
          onAdd={onAdd}
          showNav={false}
          draggable
          now={now}
        />
      </Box>
      <DragOverlay dropAnimation={null}>
        {draggedItem && (
          <Paper elevation={6} sx={{ px: 2, py: 1, borderRadius: 3, maxWidth: 280 }}>
            <Typography noWrap sx={{ fontWeight: 600 }}>
              {draggedItem.name}
            </Typography>
          </Paper>
        )}
      </DragOverlay>
    </DndContext>
  );
}
