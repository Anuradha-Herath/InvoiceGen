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
      // Use router push instead of window.location for better Next.js handling
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
    if (typeof window === 'undefined') return false;
    try {
      const tokens = this.getTokens();
      return !!tokens?.idToken;
    } catch {
      return false;
    }
  },
};
