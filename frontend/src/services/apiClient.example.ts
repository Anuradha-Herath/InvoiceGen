/**
 * Enhanced API Client Service
 * 
 * Includes all new endpoints for clients, settings, and pagination support.
 * Reference implementation - integrate into your existing api.ts service.
 */

import axios, { AxiosInstance } from 'axios';
import { Invoice } from '@/types/invoice';
import { Client } from '@/types/client';
import { CompanySettings, UserProfile } from '@/types/settings';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add authorization header interceptor
    this.axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // ============== INVOICES ==============

  /**
   * List invoices with pagination
   * @param limit - Items per page (1-100)
   * @param lastKey - Pagination cursor from previous response
   */
  async listInvoices(limit: number = 50, lastKey?: string) {
    const params: any = { limit };
    if (lastKey) {
      params.lastKey = lastKey;
    }

    const { data } = await this.axiosInstance.get('/invoices', { params });
    return data;
  }

  /**
   * Create a new invoice
   * Validates:
   * - Each item.amount = item.quantity × item.unitPrice
   * - subtotal = sum of item amounts
   * - tax = subtotal × (taxRate / 100)
   * - total = subtotal - discount + tax
   */
  async createInvoice(invoice: Omit<Invoice, 'id' | 'userId' | 'status' | 'pdfUrl' | 'createdAt' | 'updatedAt'>) {
    const { data } = await this.axiosInstance.post('/invoices', invoice);
    return data;
  }

  async getInvoice(id: string) {
    const { data } = await this.axiosInstance.get(`/invoices/${id}`);
    return data;
  }

  async updateInvoice(id: string, updates: Partial<Invoice>) {
    const { data } = await this.axiosInstance.put(`/invoices/${id}`, updates);
    return data;
  }

  async deleteInvoice(id: string) {
    const { data } = await this.axiosInstance.delete(`/invoices/${id}`);
    return data;
  }

  /**
   * Update invoice status
   * Valid statuses: 'draft' | 'generated' | 'sent' | 'paid'
   */
  async updateInvoiceStatus(id: string, status: 'draft' | 'generated' | 'sent' | 'paid') {
    const { data } = await this.axiosInstance.patch(`/invoices/${id}/status`, { status });
    return data;
  }

  /**
   * Generate PDF for invoice
   * Updates invoice status to 'generated' and stores pdfUrl
   */
  async generateInvoicePDF(id: string) {
    const { data } = await this.axiosInstance.post(`/invoices/${id}/pdf`);
    return data;
  }

  /**
   * Send invoice via email
   * Uses stored email template with variable substitution
   * Automatically updates invoice status to 'sent'
   */
  async sendInvoiceEmail(id: string, recipientEmail: string, customMessage?: string) {
    const { data } = await this.axiosInstance.post(`/invoices/${id}/email`, {
      recipientEmail,
      message: customMessage,
    });
    return data;
  }

  // ============== CLIENTS ==============

  /**
   * List clients with pagination
   */
  async listClients(limit: number = 50, lastKey?: string) {
    const params: any = { limit };
    if (lastKey) {
      params.lastKey = lastKey;
    }

    const { data } = await this.axiosInstance.get('/clients', { params });
    return data;
  }

  /**
   * Create a new client
   */
  async createClient(client: Omit<Client, 'id' | 'userId' | 'invoices' | 'createdAt' | 'updatedAt'>) {
    const { data } = await this.axiosInstance.post('/clients', client);
    return data;
  }

  async getClient(id: string) {
    const { data } = await this.axiosInstance.get(`/clients/${id}`);
    return data;
  }

  async updateClient(id: string, updates: Partial<Client>) {
    const { data } = await this.axiosInstance.put(`/clients/${id}`, updates);
    return data;
  }

  async deleteClient(id: string) {
    const { data } = await this.axiosInstance.delete(`/clients/${id}`);
    return data;
  }

  // ============== USER SETTINGS ==============

  /**
   * Get user profile (name, email)
   */
  async getProfile(): Promise<UserProfile> {
    const { data } = await this.axiosInstance.get('/settings/profile');
    return data;
  }

  /**
   * Update user profile
   */
  async updateProfile(profile: Partial<UserProfile>) {
    const { data } = await this.axiosInstance.put('/settings/profile', profile);
    return data;
  }

  /**
   * Change user password
   * Requires current password verification and new password (min 8 chars)
   */
  async changePassword(currentPassword: string, newPassword: string) {
    const { data } = await this.axiosInstance.post('/settings/change-password', {
      currentPassword,
      newPassword,
    });
    return data;
  }

  // ============== COMPANY SETTINGS ==============

  /**
   * Get company settings
   * Returns default values if not set
   */
  async getCompanySettings(): Promise<CompanySettings> {
    const { data } = await this.axiosInstance.get('/settings/company');
    return data;
  }

  /**
   * Update company settings
   * Stores: name, address, phone, email, website, taxId
   */
  async updateCompanySettings(settings: Partial<CompanySettings>) {
    const { data } = await this.axiosInstance.put('/settings/company', settings);
    return data;
  }

  // ============== LOGO UPLOAD ==============

  /**
   * Upload company logo
   * Supports: PNG, JPEG, GIF, SVG
   * Returns logoUrl for use in invoices
   */
  async uploadLogo(file: File): Promise<{ logoUrl: string; message: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const base64String = (e.target?.result as string).split(',')[1];

          const { data } = await this.axiosInstance.post('/settings/upload-logo', {
            imageData: base64String,
            fileName: file.name,
            mimeType: file.type || 'image/jpeg',
          });

          resolve(data);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  // ============== EMAIL TEMPLATES ==============

  /**
   * Get email template
   * Returns default template if not configured
   * Includes extracted template variables
   */
  async getEmailTemplate() {
    const { data } = await this.axiosInstance.get('/settings/email-template');
    return data;
  }

  /**
   * Update email template
   * Supports variables: {{company_name}}, {{client_name}}, {{invoice_number}}, {{invoice_amount}}, {{due_date}}
   * Variables are automatically extracted from subject and message
   */
  async updateEmailTemplate(subject: string, message: string) {
    const { data } = await this.axiosInstance.put('/settings/email-template', {
      subject,
      message,
    });
    return data;
  }

  // ============== UTILITIES ==============

  /**
   * Get current authorization token
   */
  getAuthToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    // Implement if using cache layer
  }

  /**
   * Handle API errors with user-friendly messages
   */
  getErrorMessage(error: any): string {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return 'Your session has expired. Please log in again.';
      }
      if (error.response?.status === 403) {
        return 'You do not have permission to perform this action.';
      }
      if (error.response?.status === 400) {
        return error.response.data?.error || 'Invalid request. Please check your input.';
      }
      if (error.response?.status === 404) {
        return 'The requested resource was not found.';
      }
      return error.response?.data?.error || error.message || 'An error occurred. Please try again.';
    }
    return 'An unexpected error occurred. Please try again.';
  }
}

export const apiClient = new ApiClient();

/**
 * Usage examples in components:
 * 
 * // List invoices with pagination
 * const { data, lastKey } = await apiClient.listInvoices(10);
 * 
 * // Create invoice with validation
 * await apiClient.createInvoice({
 *   client: { name: "John", email: "john@example.com" },
 *   items: [{ description: "Item", quantity: 1, unitPrice: 100, amount: 100 }],
 *   subtotal: 100,
 *   tax: 10,
 *   taxRate: 10,
 *   total: 110,
 *   currency: "USD",
 *   issueDate: "2024-12-16"
 * });
 * 
 * // Manage clients
 * const clients = await apiClient.listClients();
 * await apiClient.createClient({ name: "ABC Corp", email: "contact@abc.com" });
 * 
 * // Update settings
 * await apiClient.updateCompanySettings({ name: "My Company" });
 * await apiClient.uploadLogo(logoFile);
 * await apiClient.updateEmailTemplate(subject, message);
 */
