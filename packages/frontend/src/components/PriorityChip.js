import FlagRounded from '@mui/icons-material/FlagRounded';
import { Chip } from '@mui/material';
import { PRIORITY_BY_VALUE } from '../constants';

export default function PriorityChip({ priority }) {
  if (!priority || priority === 'none') {
    return null;
  }
  const { label, color } = PRIORITY_BY_VALUE[priority];
  return (
    <Chip
      size="small"
      variant="outlined"
      label={`${label} priority`}
      icon={<FlagRounded sx={{ color: `${color} !important` }} />}
      sx={{ borderColor: color, color: 'text.primary' }}
    />
  );
}
