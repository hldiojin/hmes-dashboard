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
      const response = await axiosInstance.put(`/devices/${id}`, deviceData, {
        headers: {
          'Content-Type': 'application/json',
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
      await axiosInstance.delete(`/devices/${id}`);
    } catch (error: any) {
      console.error('Error deleting device:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },
};
