import DragIndicatorRounded from '@mui/icons-material/DragIndicatorRounded';
import { IconButton } from '@mui/material';

export default function DragHandle({ label, setActivatorNodeRef, attributes, listeners }) {
  return (
    <IconButton
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label={label}
      size="small"
      sx={{ cursor: 'grab', touchAction: 'none', color: 'text.secondary' }}
    >
      <DragIndicatorRounded />
    </IconButton>
  );
}
