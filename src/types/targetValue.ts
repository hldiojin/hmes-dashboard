export type ValueType = 'pH' | 'ConcentrationOfSolutes' | 'WaterTemperature' | 'WaterLevel';

export interface TargetValue {
  id: string;
  type: ValueType;
  minValue: number;
  maxValue: number;
}

export interface TargetValueResponse {
  data: TargetValue[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  lastPage: boolean;
}

export interface TargetValueApiResponse {
  statusCodes: number;
  response: TargetValueResponse;
}
