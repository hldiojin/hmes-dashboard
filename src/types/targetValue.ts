export enum ValueTypeEnums {
  SoluteConcentration = 'SoluteConcentration',
  Ph = 'Ph',
  WaterLevel = 'WaterLevel',
  Temperature = 'Temperature',
}

export type ValueType = 'Ph' | 'SoluteConcentration' | 'Temperature' | 'WaterLevel';

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
