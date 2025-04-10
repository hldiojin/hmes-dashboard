import {
  CreateEmployeeIncomeInput,
  DeductionItem,
  EmployeeIncome,
  EmployeeIncomeFilters,
  IncomeItem,
  PaymentStatus,
} from '../types/employee-income';

// Mock data
let mockEmployeeIncomes: EmployeeIncome[] = [
  {
    id: '1',
    employeeId: 'emp1',
    employeeName: 'John Doe',
    employeeRole: 'Manager',
    department: 'Engineering',
    period: 'April 2025',
    baseSalary: 5000,
    incomeItems: [
      {
        id: 'inc1',
        type: 'Bonus',
        amount: 1000,
        date: '2025-04-15',
        description: 'Performance bonus',
      },
    ],
    deductionItems: [
      {
        id: 'ded1',
        type: 'Tax',
        amount: 800,
        date: '2025-04-30',
        description: 'Income tax',
      },
    ],
    totalIncome: 6000,
    totalDeductions: 1000,
    netIncome: 5000,
    paymentStatus: 'Completed',
    paymentMethod: 'Bank Transfer',
    paymentDate: '2025-04-30',
    notes: '',
  },
  {
    id: '2',
    employeeId: 'emp2',
    employeeName: 'Jane Smith',
    employeeRole: 'Developer',
    department: 'Engineering',
    period: 'April 2025',
    baseSalary: 4000,
    incomeItems: [
      {
        id: 'inc2',
        type: 'Overtime',
        amount: 500,
        date: '2025-04-20',
        description: 'Weekend work',
      },
    ],
    deductionItems: [
      {
        id: 'ded3',
        type: 'Tax',
        amount: 650,
        date: '2025-04-30',
        description: 'Income tax',
      },
      {
        id: 'ded4',
        type: 'Insurance',
        amount: 150,
        date: '2025-04-30',
        description: 'Health insurance',
      },
    ],
    totalIncome: 4500,
    totalDeductions: 800,
    netIncome: 3700,
    paymentStatus: 'Completed',
    paymentMethod: 'Bank Transfer',
    paymentDate: '2025-04-30',
    notes: '',
  },
  {
    id: '3',
    employeeId: 'emp3',
    employeeName: 'Robert Johnson',
    employeeRole: 'Sales',
    department: 'Sales',
    period: 'April 2025',
    baseSalary: 3500,
    incomeItems: [
      {
        id: 'inc3',
        type: 'Commission',
        amount: 2000,
        date: '2025-04-25',
        description: 'Sales commission',
      },
    ],
    deductionItems: [
      {
        id: 'ded5',
        type: 'Tax',
        amount: 1000,
        date: '2025-04-30',
        description: 'Income tax',
      },
    ],
    totalIncome: 5500,
    totalDeductions: 1000,
    netIncome: 4500,
    paymentStatus: 'Pending',
    paymentMethod: 'Bank Transfer',
    paymentDate: null,
    notes: 'Awaiting approval',
  },
  {
    id: '4',
    employeeId: 'emp4',
    employeeName: 'Emily Brown',
    employeeRole: 'Designer',
    department: 'Design',
    period: 'April 2025',
    baseSalary: 3800,
    incomeItems: [],
    deductionItems: [
      {
        id: 'ded6',
        type: 'Tax',
        amount: 600,
        date: '2025-04-30',
        description: 'Income tax',
      },
      {
        id: 'ded7',
        type: 'Loan',
        amount: 300,
        date: '2025-04-30',
        description: 'Personal loan repayment',
      },
    ],
    totalIncome: 3800,
    totalDeductions: 900,
    netIncome: 2900,
    paymentStatus: 'Processed',
    paymentMethod: 'Bank Transfer',
    paymentDate: null,
    notes: '',
  },
  {
    id: '5',
    employeeId: 'emp5',
    employeeName: 'Michael Wilson',
    employeeRole: 'Support',
    department: 'Customer Service',
    period: 'April 2025',
    baseSalary: 3200,
    incomeItems: [
      {
        id: 'inc4',
        type: 'Bonus',
        amount: 300,
        date: '2025-04-22',
        description: 'Customer satisfaction bonus',
      },
    ],
    deductionItems: [
      {
        id: 'ded8',
        type: 'Tax',
        amount: 550,
        date: '2025-04-30',
        description: 'Income tax',
      },
    ],
    totalIncome: 3500,
    totalDeductions: 550,
    netIncome: 2950,
    paymentStatus: 'Completed',
    paymentMethod: 'Bank Transfer',
    paymentDate: '2025-04-30',
    notes: '',
  },
  {
    id: '6',
    employeeId: 'emp1',
    employeeName: 'John Doe',
    employeeRole: 'Manager',
    department: 'Engineering',
    period: 'March 2025',
    baseSalary: 5000,
    incomeItems: [
      {
        id: 'inc5',
        type: 'Bonus',
        amount: 500,
        date: '2025-03-15',
        description: 'Team performance bonus',
      },
    ],
    deductionItems: [
      {
        id: 'ded9',
        type: 'Tax',
        amount: 750,
        date: '2025-03-30',
        description: 'Income tax',
      },
      {
        id: 'ded10',
        type: 'Insurance',
        amount: 200,
        date: '2025-03-30',
        description: 'Health insurance',
      },
    ],
    totalIncome: 5500,
    totalDeductions: 950,
    netIncome: 4550,
    paymentStatus: 'Completed',
    paymentMethod: 'Bank Transfer',
    paymentDate: '2025-03-30',
    notes: '',
  },
  {
    id: '7',
    employeeId: 'emp6',
    employeeName: 'Sarah Davis',
    employeeRole: 'HR',
    department: 'Human Resources',
    period: 'April 2025',
    baseSalary: 4200,
    incomeItems: [],
    deductionItems: [
      {
        id: 'ded11',
        type: 'Tax',
        amount: 700,
        date: '2025-04-30',
        description: 'Income tax',
      },
    ],
    totalIncome: 4200,
    totalDeductions: 700,
    netIncome: 3500,
    paymentStatus: 'Pending',
    paymentMethod: 'Bank Transfer',
    paymentDate: null,
    notes: '',
  },
  {
    id: '8',
    employeeId: 'emp7',
    employeeName: 'James Taylor',
    employeeRole: 'Developer',
    department: 'Engineering',
    period: 'April 2025',
    baseSalary: 4300,
    incomeItems: [
      {
        id: 'inc6',
        type: 'Overtime',
        amount: 400,
        date: '2025-04-18',
        description: 'Project deadline overtime',
      },
    ],
    deductionItems: [
      {
        id: 'ded12',
        type: 'Tax',
        amount: 680,
        date: '2025-04-30',
        description: 'Income tax',
      },
      {
        id: 'ded13',
        type: 'Other',
        amount: 100,
        date: '2025-04-30',
        description: 'Parking fee',
      },
    ],
    totalIncome: 4700,
    totalDeductions: 780,
    netIncome: 3920,
    paymentStatus: 'Cancelled',
    paymentMethod: 'Bank Transfer',
    paymentDate: null,
    notes: 'Payment recalculation needed',
  },
];

// Helper functions
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Helper function to calculate totals
const calculateTotals = (
  baseSalary: number,
  incomeItems: IncomeItem[],
  deductionItems: DeductionItem[]
): {
  totalIncome: number;
  totalDeductions: number;
  netIncome: number;
} => {
  const incomeSum = incomeItems.reduce((sum, item) => sum + item.amount, 0);
  const deductionsSum = deductionItems.reduce((sum, item) => sum + item.amount, 0);

  const totalIncome = baseSalary + incomeSum;
  const totalDeductions = deductionsSum;
  const netIncome = totalIncome - totalDeductions;

  return {
    totalIncome,
    totalDeductions,
    netIncome,
  };
};

// CRUD Operations
// GET - Get all employee incomes with optional filters
export const getEmployeeIncomes = async (filters?: EmployeeIncomeFilters): Promise<EmployeeIncome[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredIncomes = [...mockEmployeeIncomes];

      if (filters) {
        if (filters.employeeId) {
          filteredIncomes = filteredIncomes.filter((income) => income.employeeId === filters.employeeId);
        }

        if (filters.department) {
          filteredIncomes = filteredIncomes.filter((income) => income.department === filters.department);
        }

        if (filters.period) {
          filteredIncomes = filteredIncomes.filter((income) => income.period === filters.period);
        }

        if (filters.paymentStatus) {
          filteredIncomes = filteredIncomes.filter((income) => income.paymentStatus === filters.paymentStatus);
        }
      }

      resolve(filteredIncomes);
    }, 500);
  });
};

// GET - Get employee income by ID
export const getEmployeeIncomeById = async (incomeId: string): Promise<EmployeeIncome | null> => {
  // In real app: return await api.get(`/employee-incomes/${incomeId}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      const income = mockEmployeeIncomes.find((inc) => inc.id === incomeId) || null;
      resolve(income);
    }, 500);
  });
};

// POST - Create a new employee income record
export const createEmployeeIncome = async (incomeData: CreateEmployeeIncomeInput): Promise<EmployeeIncome> => {
  // In real app: return await api.post('/employee-incomes', incomeData);
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate IDs for income and deduction items
      const incomeItems = incomeData.incomeItems.map((item: Omit<IncomeItem, 'id'>) => ({
        ...item,
        id: generateId(),
      }));

      const deductionItems = incomeData.deductionItems.map((item: Omit<DeductionItem, 'id'>) => ({
        ...item,
        id: generateId(),
      }));

      // Calculate totals
      const { totalIncome, totalDeductions, netIncome } = calculateTotals(
        incomeData.baseSalary,
        incomeItems,
        deductionItems
      );

      // Create the new income record
      const newIncome: EmployeeIncome = {
        id: generateId(),
        employeeId: incomeData.employeeId,
        employeeName: incomeData.employeeName,
        employeeRole: incomeData.employeeRole,
        department: incomeData.department,
        period: incomeData.period,
        baseSalary: incomeData.baseSalary,
        incomeItems,
        deductionItems,
        totalIncome,
        totalDeductions,
        netIncome,
        paymentStatus: 'Pending',
        paymentMethod: incomeData.paymentMethod,
        paymentDate: null,
        notes: incomeData.notes,
      };

      mockEmployeeIncomes.push(newIncome);
      resolve(newIncome);
    }, 500);
  });
};

// PUT - Update an existing employee income record
export const updateEmployeeIncome = async (
  incomeId: string,
  incomeData: Partial<EmployeeIncome>
): Promise<EmployeeIncome> => {
  // In real app: return await api.put(`/employee-incomes/${incomeId}`, incomeData);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const incomeIndex = mockEmployeeIncomes.findIndex((inc) => inc.id === incomeId);

      if (incomeIndex >= 0) {
        const currentIncome = mockEmployeeIncomes[incomeIndex];

        // Recalculate totals if necessary
        let updatedIncome = { ...currentIncome, ...incomeData };

        if (
          incomeData.baseSalary !== undefined ||
          incomeData.incomeItems !== undefined ||
          incomeData.deductionItems !== undefined
        ) {
          const { totalIncome, totalDeductions, netIncome } = calculateTotals(
            incomeData.baseSalary !== undefined ? incomeData.baseSalary : currentIncome.baseSalary,
            incomeData.incomeItems !== undefined ? incomeData.incomeItems : currentIncome.incomeItems,
            incomeData.deductionItems !== undefined ? incomeData.deductionItems : currentIncome.deductionItems
          );

          updatedIncome = {
            ...updatedIncome,
            totalIncome,
            totalDeductions,
            netIncome,
          };
        }

        // If payment status is changed to completed, set payment date
        if (incomeData.paymentStatus === 'Completed' && currentIncome.paymentStatus !== 'Completed') {
          updatedIncome.paymentDate = new Date().toISOString().split('T')[0];
        }

        mockEmployeeIncomes[incomeIndex] = updatedIncome;
        resolve(updatedIncome);
      } else {
        reject(new Error('Employee income record not found'));
      }
    }, 500);
  });
};

// PATCH - Update payment status
export const updatePaymentStatus = async (incomeId: string, status: PaymentStatus): Promise<EmployeeIncome> => {
  // In real app: return await api.patch(`/employee-incomes/${incomeId}/status`, { status });
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const incomeIndex = mockEmployeeIncomes.findIndex((inc) => inc.id === incomeId);

      if (incomeIndex >= 0) {
        const updatedIncome = {
          ...mockEmployeeIncomes[incomeIndex],
          paymentStatus: status,
        };

        // If status is completed, set payment date to today
        if (status === 'Completed') {
          updatedIncome.paymentDate = new Date().toISOString().split('T')[0];
        } else if (status === 'Cancelled' || status === 'Pending') {
          updatedIncome.paymentDate = null;
        }

        mockEmployeeIncomes[incomeIndex] = updatedIncome;
        resolve(updatedIncome);
      } else {
        reject(new Error('Employee income record not found'));
      }
    }, 500);
  });
};

// DELETE - Delete an employee income record
export const deleteEmployeeIncome = async (incomeId: string): Promise<boolean> => {
  // In real app: return await api.delete(`/employee-incomes/${incomeId}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const incomeIndex = mockEmployeeIncomes.findIndex((inc) => inc.id === incomeId);

      if (incomeIndex >= 0) {
        const income = mockEmployeeIncomes[incomeIndex];

        // Only allow deletion of pending records
        if (income.paymentStatus !== 'Pending') {
          reject(new Error(`Cannot delete income with status: ${income.paymentStatus}`));
          return;
        }

        mockEmployeeIncomes = mockEmployeeIncomes.filter((inc) => inc.id !== incomeId);
        resolve(true);
      } else {
        reject(new Error('Employee income record not found'));
      }
    }, 500);
  });
};

// Additional API for dashboards and reporting
export const getIncomeStatsByDepartment = async (
  period?: string
): Promise<{ department: string; totalNet: number; employeeCount: number }[]> => {
  // In real app: return await api.get('/employee-incomes/stats/department', { params: { period } });
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredIncomes = [...mockEmployeeIncomes];

      if (period) {
        filteredIncomes = filteredIncomes.filter((inc) => inc.period === period);
      }

      const departments = Array.from(new Set(filteredIncomes.map((inc) => inc.department)));

      const stats = departments.map((dept) => {
        const deptIncomes = filteredIncomes.filter((inc) => inc.department === dept);
        const totalNet = deptIncomes.reduce((sum, inc) => sum + inc.netIncome, 0);
        const employeeIds = new Set(deptIncomes.map((inc) => inc.employeeId));

        return {
          department: dept,
          totalNet,
          employeeCount: employeeIds.size,
        };
      });

      resolve(stats);
    }, 500);
  });
};

// Get periods for filtering
export const getAvailablePeriods = async (): Promise<string[]> => {
  // In real app: return await api.get('/employee-incomes/periods');
  return new Promise((resolve) => {
    setTimeout(() => {
      const periods = Array.from(new Set(mockEmployeeIncomes.map((inc) => inc.period)));
      resolve(periods.sort((a, b) => b.localeCompare(a))); // Sort newest first
    }, 500);
  });
};

// Get employee list for dropdown selection
export const getEmployeeList = async (): Promise<{ id: string; name: string; role: string; department: string }[]> => {
  // In real app: return await api.get('/employees');
  return new Promise((resolve) => {
    setTimeout(() => {
      const uniqueEmployees = new Map();

      mockEmployeeIncomes.forEach((inc) => {
        if (!uniqueEmployees.has(inc.employeeId)) {
          uniqueEmployees.set(inc.employeeId, {
            id: inc.employeeId,
            name: inc.employeeName,
            role: inc.employeeRole,
            department: inc.department,
          });
        }
      });

      resolve(Array.from(uniqueEmployees.values()));
    }, 500);
  });
};
