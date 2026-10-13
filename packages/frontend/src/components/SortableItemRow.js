import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DragHandle from './DragHandle';
import ItemRow from './ItemRow';

export default function SortableItemRow({ item, ...rowProps }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  return (
    <ItemRow
      item={item}
      {...rowProps}
      rowRef={setNodeRef}
      rowStyle={{
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : undefined,
        position: 'relative',
        zIndex: isDragging ? 1 : undefined,
      }}
      dragHandle={
        <DragHandle
          label={`Move ${item.name}`}
          setActivatorNodeRef={setActivatorNodeRef}
          attributes={attributes}
          listeners={listeners}
        />
      }
    />
  );
}
