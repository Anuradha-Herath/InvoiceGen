import { apiClient } from './api';
import { LoginCredentials, SignupData, AuthTokens } from '@/types/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  async signup(data: SignupData): Promise<{ message: string; userId: string }> {
    const response = await apiClient.post('/auth/signup', data);
    return response.data;
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authTokens');
      window.location.href = '/auth/login';
    }
  },

  getTokens(): AuthTokens | null {
    if (typeof window !== 'undefined') {
      const tokens = localStorage.getItem('authTokens');
      return tokens ? JSON.parse(tokens) : null;
    }
    return null;
  },

  setTokens(tokens: AuthTokens) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authTokens', JSON.stringify(tokens));
    }
  },

  isAuthenticated(): boolean {
    return !!this.getTokens();
  },
};
