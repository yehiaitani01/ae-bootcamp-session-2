import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import EventRounded from '@mui/icons-material/EventRounded';
import { Box, Checkbox, Chip, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import { COLOR_HEX } from '../constants';
import { formatDueLabel, isOverdue } from '../utils/dates';
import PriorityChip from './PriorityChip';

export default function ItemRow({
  item,
  handlers,
  now = new Date(),
  dragHandle = null,
  rowRef,
  rowStyle,
}) {
  const { onToggle, onEdit, onDelete, onDuplicate } = handlers;
  const overdue = isOverdue(item, now);
  const accent = COLOR_HEX[item.color];

  return (
    <Paper
      component="li"
      ref={rowRef}
      style={rowStyle}
      data-testid="item-row"
      sx={{
        listStyle: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        pl: 0.5,
        pr: 1,
        py: 0.5,
        borderRadius: 3,
        borderLeft: `6px solid ${accent || 'transparent'}`,
        opacity: item.completed ? 0.7 : 1,
      }}
    >
      {dragHandle}
      <Checkbox
        checked={Boolean(item.completed)}
        onChange={() => onToggle(item)}
        slotProps={{
          input: {
            'aria-label': `${item.completed ? 'Mark as not done' : 'Mark as done'}: ${item.name}`,
          },
        }}
      />
      <Box sx={{ flex: 1, minWidth: 0, py: 0.5 }}>
        <Typography
          sx={{
            fontWeight: 600,
            overflowWrap: 'anywhere',
            textDecoration: item.completed ? 'line-through' : 'none',
          }}
        >
          {item.name}
        </Typography>
        {item.description && (
          <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
            {item.description}
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.5 }}>
          {item.due_date && (
            <Chip
              size="small"
              icon={<EventRounded />}
              label={formatDueLabel(item.due_date, now)}
              color={overdue ? 'error' : 'default'}
              variant={overdue ? 'filled' : 'outlined'}
            />
          )}
          <PriorityChip priority={item.priority} />
        </Box>
      </Box>
      <Tooltip title="Edit">
        <IconButton aria-label={`Edit ${item.name}`} onClick={() => onEdit(item)}>
          <EditRounded />
        </IconButton>
      </Tooltip>
      <Tooltip title="Duplicate">
        <IconButton aria-label={`Duplicate ${item.name}`} onClick={() => onDuplicate(item)}>
          <ContentCopyRounded />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton aria-label={`Delete ${item.name}`} onClick={() => onDelete(item)}>
          <DeleteOutlineRounded />
        </IconButton>
      </Tooltip>
    </Paper>
  );
}
