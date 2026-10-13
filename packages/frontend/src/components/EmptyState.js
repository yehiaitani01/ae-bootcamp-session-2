import { Box, Button, Typography } from '@mui/material';

export default function EmptyState({ icon, title, message, actionLabel, onAction }) {
  return (
    <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
      <Box
        aria-hidden
        sx={{
          width: 96,
          height: 96,
          mx: 'auto',
          mb: 2,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          color: 'primary.main',
          background:
            'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.9), rgba(30,155,232,0.22) 60%, rgba(61,214,181,0.25))',
          boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.7), 0 8px 24px rgba(30,155,232,0.18)',
          '& svg': { fontSize: 44 },
        }}
      >
        {icon}
      </Box>
      <Typography variant="h2" component="p" gutterBottom>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: actionLabel ? 3 : 0 }}>
        {message}
      </Typography>
      {actionLabel && (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
