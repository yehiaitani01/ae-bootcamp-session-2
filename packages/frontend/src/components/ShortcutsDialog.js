import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

const SHORTCUTS = [
  ['n', 'New task'],
  ['/', 'Search tasks'],
  ['1', 'List view'],
  ['2', 'Day view'],
  ['3', 'Calendar view'],
  ['t', 'Jump to today'],
  ['?', 'Show this help'],
];

export default function ShortcutsDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="shortcuts-title">
      <DialogTitle id="shortcuts-title">Keyboard shortcuts</DialogTitle>
      <DialogContent>
        <Box
          component="dl"
          sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 1.5, m: 0 }}
        >
          {SHORTCUTS.map(([key, description]) => (
            <Box key={key} sx={{ display: 'contents' }}>
              <Box
                component="dt"
                sx={{
                  px: 1.25,
                  py: 0.25,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  fontFamily: 'monospace',
                  textAlign: 'center',
                }}
              >
                {key}
              </Box>
              <Box component="dd" sx={{ m: 0 }}>
                {description}
              </Box>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
