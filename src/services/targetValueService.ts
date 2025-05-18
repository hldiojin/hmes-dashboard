import { Plant } from '@/types/plant';

import axiosInstance from '../api/axiosInstance';
import { TargetValueApiResponse, ValueType } from '../types/targetValue';
import { Phase } from './phaseService';

export interface TargetValue {
  id: string;
  type: string;
  minValue: number;
  maxValue: number;
}

export interface PlantPhaseWithTarget {
  phaseId: string;
  phaseName: string;
  target: TargetValue[];
}

export interface PlantDetails {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  phases: PlantPhaseWithTarget[];
}

export interface PlantDetailsResponse {
  statusCodes: number;
  response: {
    data: PlantDetails;
  };
}

export interface TargetValuesResponse {
  statusCodes: number;
  response: {
    data: TargetValue[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    lastPage: boolean;
  };
}

export interface PlantWithPhase {
  plantOfPhaseId: string;
  plantId: string;
  plantName: string;
  phaseId: string;
  phaseName: string;
}

export interface TargetValueWithPlants {
  id: string;
  type: string;
  minValue: number;
  maxValue: number;
  plants: PlantWithPhase[];
}

export interface TargetValueWithPlantsResponse {
  statusCodes: number;
  response: {
    data: TargetValueWithPlants;
  };
}

const targetValueService = {
  getPlantDetails: async (id: string): Promise<PlantDetailsResponse> => {
    const response = await axiosInstance.get(`/plant/${id}`);
    return response.data;
  },

  updateTargetValue: async (
    plantId: string,
    targetId: string,
    phaseId: string,
    minValue: number,
    maxValue: number
  ): Promise<TargetValue> => {
    const response = await axiosInstance.put(`/plant/${plantId}/target/${targetId}/phase/${phaseId}`, {
      minValue,
      maxValue,
    });
    return response.data.response.data;
  },

  getAllTargetValues: async (
    type?: ValueType | null,
    minValue?: number | null,
    maxValue?: number | null,
    pageIndex: number = 1,
    pageSize: number = 10
  ): Promise<TargetValueApiResponse> => {
    const params = new URLSearchParams();

    if (type) params.append('type', type);
    if (minValue !== undefined && minValue !== null) params.append('minValue', minValue.toString());
    if (maxValue !== undefined && maxValue !== null) params.append('maxValue', maxValue.toString());
    params.append('pageIndex', pageIndex.toString());
    params.append('pageSize', pageSize.toString());
    params.append('_t', new Date().getTime().toString());

    const url = `/target-value?${params.toString()}`;
    console.log('Fetching target values from URL:', url);

    try {
      const config = {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      };

      const response = await axiosInstance.get(url, config);
      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Không thể tải danh sách giá trị mục tiêu:', error);
      throw error;
    }
  },

  createTargetValue: async (data: { type: ValueType; minValue: number; maxValue: number }) => {
    try {
      console.log('Creating target value with data:', data);

      const formData = new FormData();
      formData.append('type', data.type);
      formData.append('minValue', data.minValue.toString());
      formData.append('maxValue', data.maxValue.toString());

      const response = await axiosInstance.post('/target-value', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Create response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Lỗi API:', error.response?.data || error.message);
      throw error;
    }
  },

  updateTargetValueById: async (id: string, type: string, minValue: number, maxValue: number): Promise<TargetValue> => {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('minValue', minValue.toString());
    formData.append('maxValue', maxValue.toString());

    try {
      const response = await axiosInstance.put(`/target-value/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.statusCodes >= 400) {
        const error = new Error(response.data.response.message || 'Không thể cập nhật giá trị mục tiêu');
        (error as any).response = { data: response.data };
        throw error;
      }

      return response.data.response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteTargetValue: async (id: string): Promise<void> => {
    try {
      const response = await axiosInstance.delete(`/target-value/${id}`);

      if (response.data?.statusCodes >= 400) {
        const error = new Error(response.data.response.message || 'Không thể xóa giá trị mục tiêu');
        (error as any).response = { data: response.data };
        throw error;
      }
    } catch (error) {
      throw error;
    }
  },

  setValueForPlant: async (plantId: string, targetId: string, phaseId: string): Promise<void> => {
    try {
      const response = await axiosInstance.post(`/plant/${plantId}/target/${targetId}/phase/${phaseId}`);

      if (response.data?.statusCodes >= 400) {
        const error = new Error(response.data.response.message || 'Không thể thiết lập giá trị mục tiêu cho cây trồng');
        (error as any).response = { data: response.data };
        throw error;
      }
    } catch (error) {
      throw error;
    }
  },

  getTargetValueDetails: async (id: string): Promise<TargetValueWithPlantsResponse> => {
    const response = await axiosInstance.get(`/target-value/${id}`);
    return response.data;
  },

  getPlantsWithoutTargetValueType: async (type: string): Promise<Plant[]> => {
    const response = await axiosInstance.get(`/plant/not-set-value/${type}`);
    return response.data.response;
  },

  removeValueFromPlant: async (plantId: string, targetId: string, phaseId: string): Promise<void> => {
    try {
      const response = await axiosInstance.delete(`/plant/${plantId}/target/${targetId}/phase/${phaseId}`);

      if (response.data?.statusCodes >= 400) {
        const error = new Error(response.data.response.message || 'Không thể xóa giá trị mục tiêu từ cây trồng');
        (error as any).response = { data: response.data };
        throw error;
      }
    } catch (error) {
      throw error;
    }
  },
};

export default targetValueService;
