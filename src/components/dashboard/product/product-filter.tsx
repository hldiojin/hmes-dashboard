import * as React from 'react';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

interface ProductFiltersProps {
  searchQuery: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProductFilters({ searchQuery, onSearchChange }: ProductFiltersProps): React.JSX.Element {
  return (
    <Card sx={{ p: 2 }}>
      <OutlinedInput
        value={searchQuery}
        onChange={onSearchChange}
        fullWidth
        placeholder="Search product"
        startAdornment={
          <InputAdornment position="start">
            <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
          </InputAdornment>
        }
        sx={{ maxWidth: '500px' }}
      />
    </Card>
  );
}