export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    // customers: '/dashboard/customers',
    category: '/dashboard/category',
    products: '/dashboard/product',
    plants: '/dashboard/plant',
    tickets: '/dashboard/tickets',
    //  integrations: '/dashboard/integrations',
    settings: '/dashboard/settings',
    targetValue: '/dashboard/target-value',
    users: '/dashboard/users',
    order: '/dashboard/order',
    employeeIncome: '/dashboard/employee-income',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
