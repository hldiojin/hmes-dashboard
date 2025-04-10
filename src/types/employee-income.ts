export type PaymentStatus = 'Pending' | 'Processing' | 'Processed' | 'Completed' | 'Cancelled';

export type PaymentMethod = 'Bank Transfer' | 'Cash' | 'Check';

export interface IncomeItem {
  id: string;
  type: string;
  amount: number;
  date: string;
  description: string;
}

export interface DeductionItem {
  id: string;
  type: string;
  amount: number;
  date: string;
  description: string;
}

export interface EmployeeIncome {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  department: string;
  period: string;
  baseSalary: number;
  incomeItems: IncomeItem[];
  deductionItems: DeductionItem[];
  totalIncome: number;
  totalDeductions: number;
  netIncome: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentDate: string | null;
  notes: string;
}

export interface EmployeeIncomeFilters {
  employeeId?: string;
  department?: string;
  period?: string;
  paymentStatus?: PaymentStatus;
}

export interface CreateEmployeeIncomeInput {
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  department: string;
  period: string;
  baseSalary: number;
  incomeItems: Omit<IncomeItem, 'id'>[];
  deductionItems: Omit<DeductionItem, 'id'>[];
  paymentMethod: PaymentMethod;
  notes: string;
}
