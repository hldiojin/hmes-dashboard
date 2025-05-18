import axiosInstance from '../api/axiosInstance';

export interface Phase {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
}

export interface PhaseResponse {
  statusCodes: number;
  response: {
    data: Phase[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    lastPage: boolean;
  };
}

export interface SinglePhaseResponse {
  statusCodes: number;
  response: {
    data: Phase;
  };
}

const phaseService = {
  getAllPhases: async (): Promise<PhaseResponse> => {
    const response = await axiosInstance.get('/phase');
    return response.data;
  },

  getPhaseById: async (id: string): Promise<Phase> => {
    const response = await axiosInstance.get(`/phase/${id}`);
    return response.data.response.data;
  },

  createPhase: async (name: string): Promise<Phase> => {
    const formData = new FormData();
    formData.append('Name', name);

    const response = await axiosInstance.post('/phase', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.response.data;
  },

  updatePhase: async (id: string, name: string): Promise<Phase> => {
    const formData = new FormData();
    formData.append('Name', name);

    const response = await axiosInstance.put(`/phase/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.response.data;
  },
};

export default phaseService;
