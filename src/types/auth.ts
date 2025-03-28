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
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  data?: AuthResponse;
  error?: string;
}
