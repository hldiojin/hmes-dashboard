import axiosInstance from '../api/axiosInstance';
import { TargetValueApiResponse, ValueType } from '../types/targetValue';

export interface TargetValue {
  id: string;
  type: string;
  minValue: number;
  maxValue: number;
}

export interface PlantDetails {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  target: TargetValue[];
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

export interface PlantSummary {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
}

export interface TargetValueWithPlants {
  id: string;
  type: string;
  minValue: number;
  maxValue: number;
  plants: PlantSummary[];
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
    minValue: number,
    maxValue: number
  ): Promise<TargetValue> => {
    const response = await axiosInstance.put(`/plant/${plantId}/target/${targetId}`, {
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
    // Add a cache-busting parameter to avoid browser caching
    params.append('_t', new Date().getTime().toString());

    const url = `/target-value?${params.toString()}`;
    console.log('Fetching target values from URL:', url);
    
    try {
      const response = await axiosInstance.get(url);
      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching target values:', error);
      throw error;
    }
  },

  createTargetValue: async (data: {
    type: ValueType;
    minValue: number;
    maxValue: number;
  }) => {
    try {
      console.log('Creating target value with data:', data);
      const response = await axiosInstance.post('/target-value', data);
      console.log('Create response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API Error:', error.response?.data || error.message);
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

      // Check for error in response even if HTTP status is 200
      if (response.data.statusCodes >= 400) {
        const error = new Error(response.data.response.message || 'Target value update failed');
        (error as any).response = { data: response.data };
        throw error;
      }

      return response.data.response.data;
    } catch (error) {
      // Re-throw the error to be handled by the component
      throw error;
    }
  },

  deleteTargetValue: async (id: string): Promise<void> => {
    try {
      const response = await axiosInstance.delete(`/target-value/${id}`);

      // Check for error in response even if HTTP status is 200
      if (response.data?.statusCodes >= 400) {
        const error = new Error(response.data.response.message || 'Target value deletion failed');
        (error as any).response = { data: response.data };
        throw error;
      }
    } catch (error) {
      // Re-throw the error to be handled by the component
      throw error;
    }
  },

  changeTargetValue: async (plantId: string, targetId: string, newTargetId: string): Promise<void> => {
    await axiosInstance.put(`/plant/target/change`, {
      plantId,
      targetId,
      newTargetId,
    });
  },

  setValueForPlant: async (plantId: string, targetId: string): Promise<void> => {
    try {
      const response = await axiosInstance.post(`/plant/${plantId}/target/${targetId}`);

      // Check for error in response even if HTTP status is 200
      if (response.data?.statusCodes >= 400) {
        const error = new Error(response.data.response.message || 'Failed to set target value for plant');
        (error as any).response = { data: response.data };
        throw error;
      }
    } catch (error) {
      // Re-throw the error to be handled by the component
      throw error;
    }
  },

  getTargetValueDetails: async (id: string): Promise<TargetValueWithPlantsResponse> => {
    const response = await axiosInstance.get(`/target-value/${id}`);
    return response.data;
  },

  getPlantsWithoutTargetValueType: async (type: string): Promise<PlantSummary[]> => {
    const response = await axiosInstance.get(`/plant/not-set-value/${type}`);
    return response.data.response;
  },

  removeValueFromPlant: async (plantId: string, targetId: string): Promise<void> => {
    try {
      const response = await axiosInstance.delete(`/plant/${plantId}/target/${targetId}`);

      // Check for error in response even if HTTP status is 200
      if (response.data?.statusCodes >= 400) {
        const error = new Error(response.data.response.message || 'Failed to remove target value from plant');
        (error as any).response = { data: response.data };
        throw error;
      }
    } catch (error) {
      // Re-throw the error to be handled by the component
      throw error;
    }
  },
};

export default targetValueService;
