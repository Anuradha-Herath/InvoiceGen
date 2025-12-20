export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanySettings {
  userId: string;
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplate {
  userId: string;
  subject: string;
  message: string;
  variables: string[]; // e.g., ["{{company_name}}", "{{client_name}}", ...]
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface UpdateCompanySettingsRequest {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
}

export interface UpdateEmailTemplateRequest {
  subject?: string;
  message?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
