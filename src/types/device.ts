import { ApiResponse, PaginatedResponse } from '@/services/userService';

export interface Device {
  id: string;
  name: string;
  serialNumber: string;
  model: string;
  manufacturer: string;
  status: 'Active' | 'Inactive' | 'Maintenance';
  location?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  purchaseDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceResponse extends ApiResponse<PaginatedResponse<Device>> {}

export interface DeviceDetailsResponse extends ApiResponse<Device> {}

export interface CreateDeviceRequest {
  name: string;
  serialNumber: string;
  model: string;
  manufacturer: string;
  status: 'Active' | 'Inactive' | 'Maintenance';
  location?: string;
  purchaseDate?: string;
  notes?: string;
}

export interface UpdateDeviceRequest extends Partial<CreateDeviceRequest> {
  id: string;
} 