import axiosInstance from '@/api/axiosInstance';

import { AuthResponse, AuthResult, LoginCredentials } from '@/types/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const response = await axiosInstance.post('auth/login', credentials);

      // Handle the new response structure
      if (response.data && response.data.statusCodes === 200 && response.data.response && response.data.response.data) {
        const userData = response.data.response.data;

        // Store token in localStorage for subsequent API calls
        if (userData.auth && userData.auth.token) {
          localStorage.setItem('token', userData.auth.token);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Log success message in Vietnamese
          console.log(`Đăng nhập thành công. Xin chào ${userData.fullName || 'admin'}`);
        }

        return { data: userData };
      } else {
        // Handle unsuccessful login or unexpected response format
        console.error('Không thể đăng nhập: Phản hồi không hợp lệ từ máy chủ', response.data);
        return { error: 'Phản hồi không hợp lệ từ máy chủ' };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      console.error('Lỗi đăng nhập:', errorMessage);
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
