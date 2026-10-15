export type UserRole = 'epidemiologist' | 'health_officer' | 'analyst' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  department?: string;
  avatarUrl?: string;
  lastLogin?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  organization: string;
  agreeToTerms: boolean;
}

export interface ForgotPasswordData {
  email: string;
}
