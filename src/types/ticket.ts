export enum TicketType {
  Shopping = 'Shopping',
  Technical = 'Technical',
}

export enum TicketStatus {
  InProgress = 'InProgress',
  Done = 'Done',
  Closed = 'Closed',
  IsTransferring = 'IsTransferring',
  TransferRejected = 'TransferRejected',
  Pending = 'Pending',
}

export interface Ticket {
  id: string;
  userFullName: string;
  briefDescription: string;
  description?: string;
  type: TicketType;
  status: TicketStatus;
  createdBy: string;
  handledBy: string | null;
  isProcessed?: boolean;
  createdAt: string;
  deviceItemId?: string;
  deviceItemSerial?: string;
  attachments?: string[];
  ticketResponses?: any[];
}

// Device item detail component
export interface DeviceItemDetail {
  id: string;
  name: string;
  serial: string;
}

// Device item from ticket/device/{id} API
export interface DeviceItem {
  id: string;
  serial: string;
  warrantyExpiryDate: string;
  details: DeviceItemDetail[];
}

export interface DeviceItemResponse {
  statusCodes: number;
  response: {
    data: DeviceItem;
  };
}

export interface TicketData {
  data: Ticket[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  lastPage: boolean;
}

export interface TicketListResponse {
  statusCodes: number;
  response: TicketData;
}

export interface TicketDetailResponse {
  statusCodes: number;
  response: {
    data: Ticket;
  };
}

export interface TicketResponse {
  id: string;
  message: string;
  userId: string;
  userFullName: string;
  createdAt: string;
  attachments: string[];
}

export interface TicketResponseResult {
  statusCodes: number;
  response: {
    data: Ticket;
  };
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  attachment: string | null;
}

export interface StaffListResponse {
  statusCodes: number;
  response: {
    data: Staff[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    lastPage: boolean;
  };
}

export interface TransferResponse {
  statusCodes: number;
  response: {
    message: string;
  };
}
