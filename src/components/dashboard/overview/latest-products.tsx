import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { Clock as ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export interface Product {
  id: string;
  name: string;
  updatedAt: Date | number;
  price: string;
  image: string;
}

export interface LatestProductsProps {
  products?: Product[];
  sx?: SxProps;
}

export function LatestProducts({ products = [], sx }: LatestProductsProps): React.JSX.Element {
  return (
    <Card sx={sx}>
      <CardHeader title="Sản phẩm mới thêm" />
      <List sx={{ p: 0 }}>
        {products.map((product, index) => {
          const updatedAt = dayjs(product.updatedAt).fromNow();
          const showDivider = index < products.length - 1;

          return (
            <React.Fragment key={product.id}>
              <ListItem sx={{ px: 3, py: 2 }}>
                <ListItemAvatar sx={{ pr: 2 }}>
                  <Avatar alt={product.name} src={product.image} variant="rounded" />
                </ListItemAvatar>
                <ListItemText
                  disableTypography
                  primary={
                    <Link color="text.primary" noWrap underline="none" variant="subtitle2">
                      {product.name}
                    </Link>
                  }
                  secondary={
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.5 }}>
                      <Typography color="text.secondary" variant="caption">
                        {product.price}
                      </Typography>
                      <Box
                        sx={{
                          height: 4,
                          width: 4,
                          borderRadius: '50%',
                          bgcolor: 'text.secondary',
                        }}
                      />
                      <Stack sx={{ alignItems: 'center' }} direction="row" spacing={0.5}>
                        <ClockIcon fontSize="var(--icon-fontSize-sm)" />
                        <Typography color="text.secondary" variant="caption">
                          {updatedAt}
                        </Typography>
                      </Stack>
                    </Stack>
                  }
                />
              </ListItem>
              {showDivider && <Divider />}
            </React.Fragment>
          );
        })}
      </List>
    </Card>
  );
}
