import { useDraggable } from '@dnd-kit/core';
import DragHandle from './DragHandle';
import ItemRow from './ItemRow';

export default function DraggableItemRow({ item, ...rowProps }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({
    id: item.id,
  });

  return (
    <ItemRow
      item={item}
      {...rowProps}
      rowRef={setNodeRef}
      rowStyle={{ opacity: isDragging ? 0.4 : undefined }}
      dragHandle={
        <DragHandle
          label={`Move ${item.name} to another day`}
          setActivatorNodeRef={setActivatorNodeRef}
          attributes={attributes}
          listeners={listeners}
        />
      }
    />
  );
}
