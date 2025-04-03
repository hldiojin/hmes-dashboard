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
  attachments?: string[];
  ticketResponses?: any[];
}

export interface TicketData {
  data: Ticket[];
  total: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
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
