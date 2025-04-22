import axiosInstance from '@/api/axiosInstance';
import { 
  CreateDeviceRequest, 
  Device, 
  DeviceDetailsResponse, 
  DeviceResponse, 
  UpdateDeviceRequest 
} from '@/types/device';

export const deviceService = {
  async getDevices(
    pageIndex: number = 1,
    pageSize: number = 10,
    keyword?: string,
    status?: string,
    sortBy: string = 'createdAt',
    sortDirection: string = 'desc'
  ): Promise<DeviceResponse> {
    const params = new URLSearchParams({
      pageIndex: pageIndex.toString(),
      pageSize: pageSize.toString(),
      sortBy,
      sortDirection,
      ...(keyword && { keyword }),
      ...(status && { status }),
    });

    const response = await axiosInstance.get(`/devices?${params.toString()}`);
    return response.data;
  },

  async getDeviceById(id: string): Promise<DeviceDetailsResponse> {
    const response = await axiosInstance.get(`/devices/${id}`);
    return response.data;
  },

  async createDevice(deviceData: CreateDeviceRequest): Promise<DeviceDetailsResponse> {
    try {
      console.log('Creating device with data:', deviceData);
      
      const response = await axiosInstance.post('/devices', deviceData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Create device response:', response);
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