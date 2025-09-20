export interface User {
  username: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface CreateUserData {
  userName: string;
  firstName: string;
  lastName?: string;
  password: string;
  role: 'admin' | 'user';
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  password?: string;
  role?: 'admin' | 'user';
}

export interface ScriptData {
  script: string;
  type: 'sql' | 'node' | 'shell';
}

export interface ScriptResult {
  success: boolean;
  data?: unknown;
  stdout?: string;
  stderr?: string;
  error?: string;
  message: string;
}

export interface PredefinedScript {
  id: string;
  name: string;
  description: string;
  type: 'sql' | 'node' | 'shell';
  script: string;
}