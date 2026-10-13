import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import AssignmentTurnedInRounded from '@mui/icons-material/AssignmentTurnedInRounded';
import { Box, Typography } from '@mui/material';
import { groupItemsByDay, groupItemsManually } from '../utils/grouping';
import EmptyState from './EmptyState';
import ItemRow from './ItemRow';
import SortableItemRow from './SortableItemRow';

const SCREEN_READER_INSTRUCTIONS =
  'To move a task, focus its Move button and press space or enter. Use the arrow keys to choose a new position, then press space or enter to drop it, or escape to cancel.';

export default function ListView({
  items,
  handlers,
  hasFilters,
  manualOrder = false,
  onAdd,
  onReorder,
  now = new Date(),
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (items.length === 0) {
    return hasFilters ? (
      <EmptyState
        icon={<AssignmentTurnedInRounded />}
        title="No matching tasks"
        message="Try changing your search or filters."
      />
    ) : (
      <EmptyState
        icon={<AssignmentTurnedInRounded />}
        title="Nothing to do yet"
        message="Add your first task to get started."
        actionLabel="Add a task"
        onAction={onAdd}
      />
    );
  }

  const groups = manualOrder ? groupItemsManually(items) : groupItemsByDay(items, now);
  const isSortable = (group) => group.id !== 'completed';
  const sortableIds = groups.filter(isSortable).flatMap((group) => group.items.map((i) => i.id));
  const nameOf = (id) => items.find((item) => item.id === id)?.name;
  const positionOf = (id) => `${sortableIds.indexOf(id) + 1} of ${sortableIds.length}`;

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) {
      return;
    }
    onReorder(arrayMove(sortableIds, sortableIds.indexOf(active.id), sortableIds.indexOf(over.id)));
  };

  const announcements = {
    onDragStart: ({ active }) =>
      `Picked up ${nameOf(active.id)}, position ${positionOf(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over ? `${nameOf(active.id)} is over position ${positionOf(over.id)}.` : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? `Dropped ${nameOf(active.id)} at position ${positionOf(over.id)}.`
        : `Dropped ${nameOf(active.id)}.`,
    onDragCancel: ({ active }) => `Move cancelled. ${nameOf(active.id)} returned to its place.`,
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      accessibility={{
        announcements,
        screenReaderInstructions: { draggable: SCREEN_READER_INSTRUCTIONS },
      }}
    >
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <Box>
          {groups.map((group) => (
            <Box
              component="section"
              key={group.id}
              aria-labelledby={`group-${group.id}`}
              sx={{ mb: 3 }}
            >
              <Typography
                id={`group-${group.id}`}
                variant="h3"
                component="h2"
                sx={{ mb: 1, color: group.tone === 'danger' ? 'error.main' : 'text.secondary' }}
              >
                {group.label} ({group.items.length})
              </Typography>
              <Box component="ul" sx={{ display: 'grid', gap: 1, p: 0, m: 0 }}>
                {group.items.map((item) =>
                  isSortable(group) ? (
                    <SortableItemRow key={item.id} item={item} handlers={handlers} now={now} />
                  ) : (
                    <ItemRow key={item.id} item={item} handlers={handlers} now={now} />
                  ),
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </SortableContext>
    </DndContext>
  );
}
