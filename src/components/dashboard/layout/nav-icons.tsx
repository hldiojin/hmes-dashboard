import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { Leaf } from '@phosphor-icons/react/dist/ssr';
import { ChartPie as ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { Cube as CubeIcon } from '@phosphor-icons/react/dist/ssr/Cube';
import { GearSix as GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { Money as MoneyIcon } from '@phosphor-icons/react/dist/ssr/Money';
import { NotePencil as NotePencilIcon } from '@phosphor-icons/react/dist/ssr/NotePencil';
import { PlugsConnected as PlugsConnectedIcon } from '@phosphor-icons/react/dist/ssr/PlugsConnected';
import { ShoppingCart as ShoppingCartIcon } from '@phosphor-icons/react/dist/ssr/ShoppingCart';
import { Tag as TagIcon } from '@phosphor-icons/react/dist/ssr/Tag';
import { Target as TargetIcon } from '@phosphor-icons/react/dist/ssr/Target';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';
import { Gauge as GaugeIcon } from '@phosphor-icons/react/dist/ssr/Gauge';

export const navIcons = {
  'chart-pie': ChartPieIcon,
  'gear-six': GearSixIcon,
  'note-pencil': NotePencilIcon,
  'plugs-connected': PlugsConnectedIcon,
  'x-square': XSquare,
  leaf: Leaf,
  user: UserIcon,
  users: UsersIcon,
  cube: CubeIcon,
  tag: TagIcon,
  target: TargetIcon,
  'shopping-cart': ShoppingCartIcon,
  money: MoneyIcon,
  'gauge': GaugeIcon,
} as Record<string, Icon>;
