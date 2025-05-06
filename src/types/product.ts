export interface Product {
  id: string;
  name: string;
  mainImage: string;
  categoryId: string;
  categoryName: string;
  price: number;
  status: string;
  description: string;
  amount: number;
  images: string[];
}

export interface ProductResponse {
  data: Product[];
  total: number;
}

export interface ApiResponse {
  response: ProductResponse;
  message: string;
  statusCode: number;
}

// Paginated response format similar to the ticket API
export interface PaginatedProductResponse {
  statusCodes: number;
  response: {
    data: Product[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    lastPage: boolean;
  };
}
