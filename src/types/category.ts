export interface Category {
  id: string;
  name: string;
  description: string;
  parentCategoryId: string | null;
  attachment: string;
  status: 'Active' | 'Inactive';
  children: Category[];
}

export interface CategoryResponse {
  statusCodes: number;
  response: {
    data: Category[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    lastPage: boolean;
  };
}
