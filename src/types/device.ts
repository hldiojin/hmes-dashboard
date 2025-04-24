import { ApiResponse, PaginatedResponse } from '@/services/userService';

export interface Device {
  id: string;
  name: string;
  description: string;
  attachment: string;
  price: number;
  quantity: number;
}

export interface DeviceResponse {
  statusCodes: number;
  response: {
    data: Device[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    lastPage: boolean;
  }
}

export interface DeviceDetailsResponse {
  statusCodes: number;
  response: Device;
}

export interface CreateDeviceRequest {
  name: string;
  description: string;
  attachment: File;
  price: number;
  quantity: number;
}

export interface UpdateDeviceRequest extends Partial<CreateDeviceRequest> {
  id: string;
} 