import { Plant, PlantResponse } from '@/types/plant';

import axiosInstance from '../api/axiosInstance';

const plantService = {
  getAllPlants: async (
    keyword?: string,
    status?: 'Active' | 'Inactive' | null,
    pageIndex: number = 1,
    pageSize: number = 10
  ): Promise<PlantResponse> => {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (status) params.append('status', status);
    params.append('pageIndex', pageIndex.toString());
    params.append('pageSize', pageSize.toString());

    const response = await axiosInstance.get(`/plant?${params.toString()}`);
    return response.data;
  },

  getPlantById: async (id: string): Promise<Plant> => {
    const response = await axiosInstance.get(`/plant/${id}`);
    const plantData = response.data.response;
    if (!plantData.targetValues) {
      plantData.targetValues = [];
    }
    return plantData;
  },

  createPlant: async (name: string, status: 'Active' | 'Inactive'): Promise<Plant> => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('status', status);

    const response = await axiosInstance.post(`/plant`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.response;
  },

  updatePlant: async (id: string, name: string, status: 'Active' | 'Inactive'): Promise<Plant> => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('status', status);

    const response = await axiosInstance.put(`/plant/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.response;
  },

  deletePlant: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/plant/${id}`);
  },
};

export default plantService;
