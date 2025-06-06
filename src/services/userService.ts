import axiosInstance from '@/api/axiosInstance';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  attachment: string | null;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  lastPage: boolean;
}

export interface ApiResponse<T> {
  statusCodes: number;
  response: T;
}

export const userService = {
  async getUsers(
    pageIndex: number = 1,
    pageSize: number = 10,
    keyword?: string,
    status?: string,
    role?: string
  ): Promise<ApiResponse<PaginatedResponse<User>>> {
    const params = new URLSearchParams({
      pageIndex: pageIndex.toString(),
      pageSize: pageSize.toString(),
      ...(keyword && { keyword }),
      ...(status && { status }),
      ...(role && { role }),
    });

    const response = await axiosInstance.get(`/admin/users?${params.toString()}`);
    return response.data;
  },

  async getUserCount(): Promise<number> {
    try {
      const response = await axiosInstance.get('/admin/users/count');
      // This endpoint returns just a number
      return response.data;
    } catch (error) {
      console.error('Error fetching user count:', error);
      return 0; // Return 0 as fallback
    }
  },

  async createUser(userData: CreateUserRequest): Promise<ApiResponse<any>> {
    try {
      console.log('Creating user with data:', userData);

      // Send the userData directly without wrapping in a data object
      const response = await axiosInstance.post('/admin/mod', userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Create user response:', response);
      return response.data;
    } catch (error: any) {
      console.error('Error creating user:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error response:', error.response);
      throw error;
    }
  },
};
