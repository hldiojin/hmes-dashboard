import axiosInstance from '@/api/axiosInstance';

import { ApiResponse, PaginatedProductResponse, Product } from '@/types/product';

class ProductService {
  async getAllProducts(
    pageIndex: number = 1,
    pageSize: number = 10,
    keyword?: string
  ): Promise<PaginatedProductResponse> {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('pageIndex', pageIndex.toString());
      params.append('pageSize', pageSize.toString());

      if (keyword && keyword.trim()) {
        params.append('keyword', keyword.trim());
      }

      console.log('Fetching products with params:', params.toString());

      const response = await axiosInstance.get<PaginatedProductResponse>(`/product/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      // Return empty response on error to prevent UI issues
      return {
        statusCodes: 500,
        response: {
          data: [],
          currentPage: pageIndex,
          totalPages: 0,
          totalItems: 0,
          pageSize: pageSize,
          lastPage: true,
        },
      };
    }
  }

  async getProductById(id: string): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.get<ApiResponse>(`/product/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createProduct(formData: FormData): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post<ApiResponse>('/product', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(id: string, formData: FormData): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.put<ApiResponse>(`/product`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/product/${id}`);
    } catch (error) {
      throw error;
    }
  }
}

export default new ProductService();
