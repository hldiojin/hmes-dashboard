import axiosInstance from '@/api/axiosInstance';

import { CategoryResponse } from '@/types/category';

export const categoryService = {
  /**
   * Get all categories
   * @returns Promise with category data response
   */
  getAllCategories: async () => {
    try {
      const response = await axiosInstance.get<CategoryResponse>('category');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * Create a new category
   * @param formData - Form data containing category details
   * @returns Promise with the created category response
   */
  createCategory: async (formData: FormData) => {
    try {
      const response = await axiosInstance.post('category', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  /**
   * Delete a category by ID
   * @param categoryId - ID of the category to delete
   * @returns Promise with the deletion response
   */
  deleteCategory: async (categoryId: string) => {
    try {
      const response = await axiosInstance.delete(`category/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  /**
   * Get a category by ID
   * @param categoryId - ID of the category to retrieve
   * @returns Promise with the category response
   */
  getCategoryById: async (categoryId: string) => {
    try {
      const response = await axiosInstance.get(`category/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category details:', error);
      throw error;
    }
  },

  /**
   * Update a category
   * @param categoryId - ID of the category to update
   * @param formData - Form data containing updated category details
   * @returns Promise with the updated category response
   */
  updateCategory: async (categoryId: string, formData: FormData) => {
    try {
      formData.append('Id', categoryId);

      const response = await axiosInstance.put(`category`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },
};

export default categoryService;
