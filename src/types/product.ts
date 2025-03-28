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
