import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-pie' },
  //  { key: 'customers', title: 'Customers', href: paths.dashboard.customers, icon: 'users' },
  { key: 'category', title: 'Category', href: paths.dashboard.category, icon: 'tag' },
  { key: 'products', title: 'Products', href: paths.dashboard.products, icon: 'cube' },
  { key: 'tickets', title: 'Tickets', href: paths.dashboard.tickets, icon: 'note-pencil' },
  //  { key: 'integrations', title: 'Integrations', href: paths.dashboard.integrations, icon: 'plugs-connected' },
  { key: 'plants', title: 'Plants', href: paths.dashboard.plants, icon: 'leaf' },
  { key: 'target-value', title: 'Target Values', href: paths.dashboard.targetValue, icon: 'target' },
  { key: 'users', title: 'Users', href: paths.dashboard.users, icon: 'users' },
  // { key: 'settings', title: 'Settings', href: paths.dashboard.settings, icon: 'gear-six' },
  { key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'user' },
  // { key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },
  { key: 'order', title: 'Orders', href: paths.dashboard.order, icon: 'shopping-cart' },
  // { key: 'employee-income', title: 'Employee Income', href: paths.dashboard.employeeIncome, icon: 'money' },
] satisfies NavItemConfig[];
