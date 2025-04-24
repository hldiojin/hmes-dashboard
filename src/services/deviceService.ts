import axiosInstance from '@/api/axiosInstance';

import {
  CreateDeviceRequest,
  Device,
  DeviceDetailsResponse,
  DeviceResponse,
  UpdateDeviceRequest,
} from '@/types/device';

export const deviceService = {
  async getDevices(pageIndex: number = 1, pageSize: number = 10): Promise<DeviceResponse> {
    const response = await axiosInstance.get('/device');
    return response.data;
  },

  async getDeviceById(id: string): Promise<DeviceDetailsResponse> {
    const response = await axiosInstance.get(`/device/${id}`);
    return response.data;
  },

  async createDevice(deviceData: CreateDeviceRequest): Promise<DeviceDetailsResponse> {
    try {
      const formData = new FormData();
      formData.append('name', deviceData.name);
      formData.append('description', deviceData.description);
      formData.append('attachment', deviceData.attachment);
      formData.append('price', deviceData.price.toString());
      formData.append('quantity', deviceData.quantity.toString());

      const response = await axiosInstance.post('/device', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Error creating device:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  async updateDevice(id: string, deviceData: UpdateDeviceRequest): Promise<DeviceDetailsResponse> {
    try {
      // Using FormData to handle file uploads
      const formData = new FormData();
      
      if (deviceData.name !== undefined) {
        formData.append('name', deviceData.name);
      }
      
      if (deviceData.description !== undefined) {
        formData.append('description', deviceData.description);
      }
      
      if (deviceData.price !== undefined) {
        formData.append('price', deviceData.price.toString());
      }
      
      if (deviceData.quantity !== undefined) {
        formData.append('quantity', deviceData.quantity.toString());
      }
      
      if (deviceData.attachment) {
        formData.append('attachment', deviceData.attachment);
      }

      const response = await axiosInstance.put(`/device/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Error updating device:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  async deleteDevice(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/device/${id}`);
    } catch (error: any) {
      console.error('Error deleting device:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },
};
