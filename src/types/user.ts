export interface User {
  id: string;
  name: string;
  email: string;
  contact_no: string;
  company_name?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  contact_no: string;
  company_name?: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
