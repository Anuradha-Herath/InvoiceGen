import axios, { AxiosInstance, AxiosError } from 'axios';
import { AuthTokens } from '@/types/auth';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const tokens = localStorage.getItem('authTokens');
          if (tokens) {
            const { idToken } = JSON.parse(tokens) as AuthTokens;
            config.headers.Authorization = `Bearer ${idToken}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Clear auth tokens and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authTokens');
            window.location.href = '/auth/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  getInstance(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient().getInstance();
