import axiosInstance from '@/api/axiosInstance';

import { AuthResponse, AuthResult, LoginCredentials } from '@/types/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const response = await axiosInstance.post<AuthResponse>('auth/login', credentials);

      // Store token in localStorage for subsequent API calls
      if (response.data && response.data.auth && response.data.auth.token) {
        localStorage.setItem('token', response.data.auth.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }

      return { data: response.data };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to sign in. Please try again.';
      return { error: errorMessage };
    }
  },

  async logout(): Promise<AuthResult> {
    try {
      // Call the logout API endpoint
      // await axiosInstance.post('auth/logout');

      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      return { data: undefined };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to sign out. Please try again.';
      return { error: errorMessage };
    }
  },

  getCurrentUser(): AuthResponse | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};
