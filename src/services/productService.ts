import axiosInstance from '@/api/axiosInstance';

import { ApiResponse, Product } from '@/types/product';

class ProductService {
  async getAllProducts(): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.get<ApiResponse>('/product');
      return response.data;
    } catch (error) {
      throw error;
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
