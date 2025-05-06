import * as React from 'react';
import { Button, Stack } from '@mui/material';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

interface ProductFiltersProps {
  searchValue?: string;
  onSearchChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit?: (event: React.FormEvent) => void;
}

export function ProductFilters({
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
}: ProductFiltersProps): React.JSX.Element {
  return (
    <Card sx={{ p: 2 }}>
      <form onSubmit={onSearchSubmit}>
        <Stack direction="row" spacing={2} alignItems="center">
          <OutlinedInput
            value={searchValue}
            onChange={onSearchChange}
            fullWidth
            placeholder="Tìm kiếm sản phẩm"
            startAdornment={
              <InputAdornment position="start">
                <MagnifyingGlassIcon />
              </InputAdornment>
            }
            sx={{ maxWidth: '500px' }}
          />
          <Button type="submit" variant="contained" size="medium">
            Tìm kiếm
          </Button>
        </Stack>
      </form>
    </Card>
  );
}
