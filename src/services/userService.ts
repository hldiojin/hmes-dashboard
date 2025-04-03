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
};
