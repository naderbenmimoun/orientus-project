export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT'
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  nationality: string;
  role: UserRole;
  createdAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  nationality: string;
}

export interface AuthResponse {
  token: string | null;
  id: number | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  message: string;
}
