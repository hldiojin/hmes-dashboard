export interface Plant {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  targetValues?: {
    type: string;
    minValue: number;
    maxValue: number;
  }[];
}

export interface PlantResponse {
  statusCodes: number;
  response: {
    data: Plant[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    lastPage: boolean;
  };
}
