import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'Tổng quan', href: paths.dashboard.overview, icon: 'chart-pie' },
  //  { key: 'customers', title: 'Customers', href: paths.dashboard.customers, icon: 'users' },
  { key: 'category', title: 'Loại sản phẩm', href: paths.dashboard.category, icon: 'tag' },
  { key: 'products', title: 'Sản phẩm', href: paths.dashboard.products, icon: 'cube' },
  { key: 'tickets', title: 'Yêu cầu hỗ trợ', href: paths.dashboard.tickets, icon: 'note-pencil' },
  //  { key: 'integrations', title: 'Integrations', href: paths.dashboard.integrations, icon: 'plugs-connected' },
  { key: 'plants', title: 'Cây trồng', href: paths.dashboard.plants, icon: 'leaf' },
  { key: 'target-value', title: 'Giá trị mục tiêu', href: paths.dashboard.targetValue, icon: 'target' },
  { key: 'users', title: 'Người dùng', href: paths.dashboard.users, icon: 'users' },
  // { key: 'settings', title: 'Settings', href: paths.dashboard.settings, icon: 'gear-six' },
  { key: 'account', title: 'Tài khoản', href: paths.dashboard.account, icon: 'user' },
  // { key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },
  { key: 'order', title: 'Đơn hàng', href: paths.dashboard.order, icon: 'shopping-cart' },
  { key: 'device', title: 'Thiết bị IoT', href: paths.dashboard.device, icon: 'gauge' },
] satisfies NavItemConfig[];
