export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  attachment: string | null;
  auth?: {
    token: string;
  };

  [key: string]: unknown;
}
