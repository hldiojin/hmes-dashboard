import { TargetValue } from '@/services/targetValueService';

export interface PlantPhase {
  phaseId: string;
  phaseName: string;
  target: TargetValue[];
}

export interface Plant {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  phases: PlantPhase[];
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
