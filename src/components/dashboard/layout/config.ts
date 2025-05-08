import type { NavItemConfig } from '@/types/nav';
import { User } from '@/types/user';
import { paths } from '@/paths';

// Define all navigation items
const allNavItems = [
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

// Function to get navigation items based on user role
export const getNavItems = (user: User | null): NavItemConfig[] => {
  if (!user) {
    return [];
  }

  // For Technician or Consultant, show all except 'Tổng quan'
  if (user.role === 'Technician' || user.role === 'Consultant') {
    return allNavItems.filter((item) => item.key !== 'overview' && item.key !== 'users');
  }

  // For Admin, show all items
  if (user.role === 'Admin') {
    return allNavItems;
  }

  // Default case, return all items (or you could return a subset for other roles)
  return allNavItems;
};

// Export the default items for backward compatibility
export const navItems = allNavItems;
