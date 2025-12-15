export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken?: string;
  idToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  cognitoSub: string;
  createdAt: string;
  updatedAt: string;
}
