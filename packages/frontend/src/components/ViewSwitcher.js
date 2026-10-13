import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import TodayRounded from '@mui/icons-material/TodayRounded';
import ViewListRounded from '@mui/icons-material/ViewListRounded';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { VIEWS } from '../constants';

const VIEW_ICONS = {
  list: <ViewListRounded />,
  day: <TodayRounded />,
  calendar: <CalendarMonthRounded />,
};

export default function ViewSwitcher({ view, onChange }) {
  return (
    <Box
      sx={{
        position: { xs: 'fixed', sm: 'static' },
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1200,
        display: 'flex',
        justifyContent: 'center',
        p: { xs: 1.5, sm: 0 },
        pb: { xs: 'max(12px, env(safe-area-inset-bottom))', sm: 0 },
        bgcolor: { xs: 'background.paper', sm: 'transparent' },
        backdropFilter: { xs: 'blur(16px)', sm: 'none' },
        borderTop: { xs: '1px solid', sm: 'none' },
        borderColor: 'divider',
      }}
    >
      <ToggleButtonGroup
        exclusive
        value={view}
        onChange={(event, next) => next && onChange(next)}
        aria-label="View"
        sx={{ bgcolor: 'background.paper' }}
      >
        {VIEWS.map(({ value, label }) => (
          <ToggleButton key={value} value={value} sx={{ gap: 1, px: 2.5 }}>
            {VIEW_ICONS[value]}
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
