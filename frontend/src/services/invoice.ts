import { apiClient } from './api';
import { Invoice, CreateInvoiceRequest } from '@/types/invoice';

export const invoiceService = {
  async create(data: CreateInvoiceRequest): Promise<Invoice> {
    const response = await apiClient.post('/invoices', data);
    return response.data;
  },

  async getById(id: string): Promise<Invoice> {
    const response = await apiClient.get(`/invoices/${id}`);
    return response.data;
  },

  async list(limit = 50, lastKey?: string): Promise<{ items: Invoice[]; lastKey: string | null; count: number }> {
    const params: any = { limit };
    if (lastKey) params.lastKey = lastKey;
    
    const response = await apiClient.get('/invoices', { params });
    return response.data;
  },

  async update(id: string, data: Partial<CreateInvoiceRequest>): Promise<Invoice> {
    const response = await apiClient.put(`/invoices/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/invoices/${id}`);
  },

  async generatePDF(id: string): Promise<{ invoice: Invoice; pdfUrl: string }> {
    const response = await apiClient.post(`/invoices/${id}/pdf`);
    return response.data;
  },

  async emailInvoice(id: string, recipientEmail: string, message?: string): Promise<{ message: string }> {
    const response = await apiClient.post(`/invoices/${id}/email`, {
      recipientEmail,
      message,
    });
    return response.data;
  },
};
