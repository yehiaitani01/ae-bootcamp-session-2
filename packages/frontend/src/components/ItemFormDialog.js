import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormLabel,
  MenuItem,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { MAX_DESCRIPTION_LENGTH, MAX_NAME_LENGTH, PRIORITIES } from '../constants';
import { buildDueDate, getDueKey, getDueTime } from '../utils/dates';
import ColorPicker from './ColorPicker';

const emptyForm = (defaults) => ({
  name: '',
  description: '',
  date: '',
  time: '',
  priority: 'none',
  color: null,
  ...defaults,
});

const fromItem = (item) => ({
  name: item.name,
  description: item.description || '',
  date: getDueKey(item.due_date) || '',
  time: getDueTime(item.due_date) || '',
  priority: item.priority || 'none',
  color: item.color || null,
});

export default function ItemFormDialog({ open, item, defaults, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm());
  const [nameError, setNameError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isEditing = Boolean(item);

  useEffect(() => {
    if (open) {
      setForm(item ? fromItem(item) : emptyForm(defaults));
      setNameError('');
      setSubmitting(false);
    }
  }, [open, item, defaults]);

  const setField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) {
      setNameError('Give your task a name.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        name,
        description: form.description.trim(),
        due_date: buildDueDate(form.date, form.date ? form.time : ''),
        priority: form.priority,
        color: form.color,
      });
      onClose();
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="item-form-title">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogTitle id="item-form-title">{isEditing ? 'Edit task' : 'New task'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: '8px !important' }}>
          <TextField
            label="Task name"
            value={form.name}
            onChange={setField('name')}
            error={Boolean(nameError)}
            helperText={nameError}
            required
            autoFocus
            slotProps={{ htmlInput: { maxLength: MAX_NAME_LENGTH } }}
          />
          <TextField
            label="Notes"
            value={form.description}
            onChange={setField('description')}
            multiline
            minRows={2}
            slotProps={{ htmlInput: { maxLength: MAX_DESCRIPTION_LENGTH } }}
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Due date"
              type="date"
              value={form.date}
              onChange={setField('date')}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Time"
              type="time"
              value={form.time}
              onChange={setField('time')}
              disabled={!form.date}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
          <TextField select label="Priority" value={form.priority} onChange={setField('priority')}>
            {PRIORITIES.map(({ value, label }) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <Box>
            <FormLabel id="color-label" sx={{ display: 'block', mb: 0.5 }}>
              Color
            </FormLabel>
            <ColorPicker
              value={form.color}
              onChange={(color) => setForm((current) => ({ ...current, color }))}
              label="Task color"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {isEditing ? 'Save changes' : 'Add task'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
