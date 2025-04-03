import axiosInstance from '../api/axiosInstance';
import {
  Ticket,
  TicketDetailResponse,
  TicketListResponse,
  TicketResponseResult,
  TicketStatus,
  TicketType,
} from '../types/ticket';

export const getTickets = async (
  endpoint: string = 'ticket',
  keyword?: string,
  type?: TicketType | string,
  status?: TicketStatus | string,
  pageIndex: number = 1,
  pageSize: number = 10
): Promise<TicketListResponse> => {
  const response = await axiosInstance.get(endpoint, {
    params: {
      keyword,
      type,
      status,
      pageIndex,
      pageSize,
    },
  });
  return response.data;
};

export const getTicketById = async (id: string): Promise<TicketDetailResponse> => {
  const response = await axiosInstance.get(`ticket/${id}`);
  return response.data;
};

export const createTicket = async (ticketData: Partial<Ticket>): Promise<Ticket> => {
  try {
    console.log('Creating ticket with data:', ticketData);
    const response = await axiosInstance.post('ticket', ticketData);
    console.log('Create ticket response:', response);
    return response.data.response.data;
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
};

export const updateTicket = async (id: string, ticketData: Partial<Ticket>): Promise<Ticket> => {
  const response = await axiosInstance.put(`ticket/${id}`, ticketData);
  return response.data.response.data;
};

export const deleteTicket = async (id: string): Promise<void> => {
  await axiosInstance.delete(`ticket/${id}`);
};

export const responseTicket = async (formData: FormData): Promise<TicketResponseResult> => {
  try {
    console.log('Submitting ticket response');

    // Log formData contents for debugging without using for...of
    console.log('FormData content:');

    // Get all form keys
    const keys = Array.from(formData.keys());
    keys.forEach((key) => {
      const values = formData.getAll(key);
      values.forEach((value) => {
        if (key === 'attachments' && value instanceof File) {
          console.log(`- ${key}: ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`- ${key}: ${value}`);
        }
      });
    });

    const response = await axiosInstance.post('ticket/response', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Response ticket result:', response);
    return response.data;
  } catch (error) {
    console.error('Error submitting ticket response:', error);
    throw error;
  }
};

export const manageTransferTicket = async (ticketId: string, decision: boolean): Promise<TicketResponseResult> => {
  try {
    console.log('Managing transfer ticket', { ticketId, decision });
    const formData = new FormData();
    formData.append('decision', decision.toString());

    const response = await axiosInstance.put(`ticket/transfer/${ticketId}/decision`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Transfer decision result:', response);
    return response.data;
  } catch (error) {
    console.error('Error managing transfer ticket:', error);
    throw error;
  }
};

export const assignTicket = async (ticketId: string): Promise<TicketResponseResult> => {
  try {
    console.log('Assigning ticket', { ticketId });
    const response = await axiosInstance.put(`ticket/assign/${ticketId}`);
    console.log('Assign ticket result:', response);
    return response.data;
  } catch (error) {
    console.error('Error assigning ticket:', error);
    throw error;
  }
};

export const getStaffs = async (role: string): Promise<any> => {
  try {
    console.log('Fetching staff with role:', role);
    const response = await axiosInstance.get(`user/staffs/${role}`);
    console.log('Staff data result:', response);
    return response.data;
  } catch (error) {
    console.error('Error fetching staff:', error);
    throw error;
  }
};

export const transferTicket = async (ticketId: string, transferToUserId: string): Promise<any> => {
  try {
    console.log('Transferring ticket', { ticketId, transferToUserId });
    const formData = new FormData();
    formData.append('transferTo', transferToUserId);

    const response = await axiosInstance.put(`ticket/transfer/${ticketId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Transfer ticket result:', response);
    return response.data;
  } catch (error) {
    console.error('Error transferring ticket:', error);
    throw error;
  }
};

export const changeTicketStatus = async (ticketId: string, status: string): Promise<any> => {
  try {
    console.log('Changing ticket status', { ticketId, status });
    const formData = new FormData();
    formData.append('status', status);

    const response = await axiosInstance.put(`ticket/status/${ticketId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Status change result:', response);
    return response.data;
  } catch (error) {
    console.error('Error changing ticket status:', error);
    throw error;
  }
};
