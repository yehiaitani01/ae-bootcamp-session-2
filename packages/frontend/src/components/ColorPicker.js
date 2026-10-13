import BlockRounded from '@mui/icons-material/BlockRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import { Box, ButtonBase } from '@mui/material';
import { TASK_COLORS } from '../constants';

function Swatch({ label, hex, selected, onSelect, children }) {
  return (
    <ButtonBase
      role="radio"
      aria-checked={selected}
      aria-label={label}
      onClick={onSelect}
      sx={{ width: 44, height: 44, borderRadius: '50%' }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: hex || 'transparent',
          border: '2px solid',
          borderColor: selected ? 'text.primary' : 'divider',
          color: '#14324A',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
        }}
      >
        {children}
      </Box>
    </ButtonBase>
  );
}

export default function ColorPicker({ value, onChange, label = 'Color' }) {
  return (
    <Box role="radiogroup" aria-label={label} sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      <Swatch label="No color" selected={!value} onSelect={() => onChange(null)}>
        <BlockRounded fontSize="small" sx={{ color: 'text.secondary' }} />
      </Swatch>
      {TASK_COLORS.map(({ key, label: colorLabel, hex }) => (
        <Swatch
          key={key}
          label={colorLabel}
          hex={hex}
          selected={value === key}
          onSelect={() => onChange(key)}
        >
          {value === key && <CheckRounded fontSize="small" />}
        </Swatch>
      ))}
    </Box>
  );
}
