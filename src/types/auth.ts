export interface AuthResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  attachment: string | null;
  auth: {
    token: string;
  };
  [key: string]: unknown; // Add index signature to match User type
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  data?: AuthResponse;
  error?: string;
}

// Add new types for API responses
export interface ApiResponse<T> {
  statusCodes: number;
  response: {
    data: T;
    message?: string;
  };
}

export interface LoginApiResponse extends ApiResponse<AuthResponse> {}
