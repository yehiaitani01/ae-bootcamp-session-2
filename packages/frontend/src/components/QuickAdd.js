import AddRounded from '@mui/icons-material/AddRounded';
import { Button, InputBase, Paper } from '@mui/material';
import { useRef, useState } from 'react';
import { MAX_NAME_LENGTH } from '../constants';

export default function QuickAdd({ onAdd, placeholder = 'Add a task and press Enter' }) {
  const [name, setName] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    setName('');
    try {
      await onAdd(trimmed);
    } catch {
      setName(trimmed);
    }
    inputRef.current?.focus();
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        pl: 2,
        pr: 0.75,
        py: 0.75,
        borderRadius: 999,
      }}
    >
      <InputBase
        fullWidth
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={placeholder}
        inputRef={inputRef}
        slotProps={{ input: { 'aria-label': 'Quick add task', maxLength: MAX_NAME_LENGTH } }}
        sx={{ minHeight: 44 }}
      />
      <Button type="submit" variant="contained" startIcon={<AddRounded />} disabled={!name.trim()}>
        Add
      </Button>
    </Paper>
  );
}
