import ArrowDownwardRounded from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRounded from '@mui/icons-material/ArrowUpwardRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import { Box, IconButton, InputAdornment, MenuItem, TextField, Tooltip } from '@mui/material';
import { PRIORITIES, SORT_OPTIONS, STATUS_FILTERS, TASK_COLORS } from '../constants';

function FilterSelect({ label, value, onChange, options }) {
  return (
    <TextField
      select
      size="small"
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      sx={{ minWidth: 130 }}
    >
      {options.map(({ value: optionValue, label: optionLabel }) => (
        <MenuItem key={optionValue} value={optionValue}>
          {optionLabel}
        </MenuItem>
      ))}
    </TextField>
  );
}

export default function FilterBar({
  search,
  onSearchChange,
  searchRef,
  filters,
  onFilterChange,
  sort,
  order,
  onSortChange,
  onOrderToggle,
}) {
  const priorityOptions = [
    { value: '', label: 'Any' },
    ...PRIORITIES.filter((p) => p.value !== 'none'),
  ];
  const colorOptions = [
    { value: '', label: 'Any' },
    ...TASK_COLORS.map(({ key, label }) => ({ value: key, label })),
  ];

  return (
    <Box
      role="search"
      sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}
      aria-label="Filter and sort tasks"
    >
      <TextField
        size="small"
        label="Search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        inputRef={searchRef}
        sx={{ flex: '1 1 200px' }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded />
              </InputAdornment>
            ),
          },
        }}
      />
      <FilterSelect
        label="Status"
        value={filters.status}
        onChange={(status) => onFilterChange({ status })}
        options={STATUS_FILTERS}
      />
      <FilterSelect
        label="Priority"
        value={filters.priority}
        onChange={(priority) => onFilterChange({ priority })}
        options={priorityOptions}
      />
      <FilterSelect
        label="Color"
        value={filters.color}
        onChange={(color) => onFilterChange({ color })}
        options={colorOptions}
      />
      <FilterSelect label="Sort by" value={sort} onChange={onSortChange} options={SORT_OPTIONS} />
      <Tooltip title={order === 'asc' ? 'Ascending' : 'Descending'}>
        <IconButton
          aria-label={`Sort direction: ${order === 'asc' ? 'ascending' : 'descending'}`}
          onClick={onOrderToggle}
        >
          {order === 'asc' ? <ArrowUpwardRounded /> : <ArrowDownwardRounded />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
