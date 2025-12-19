export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number; // lineAmount = quantity * unitPrice
}

export interface InvoiceClient {
  name: string;
  email: string;
  address?: string;
  phone?: string;
  company?: string;
}

export interface Invoice {
  id: string;
  userId: string;
  invoiceNumber?: string;
  client: InvoiceClient;
  items: InvoiceItem[];
  subtotal: number;
  tax?: number;
  taxRate?: number;
  discount?: number;
  total: number;
  currency: string;
  issueDate: string;
  dueDate?: string;
  notes?: string;
  status: 'draft' | 'generated' | 'sent' | 'paid';
  pdfUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceRequest {
  invoiceNumber?: string;
  client: InvoiceClient;
  items: InvoiceItem[];
  subtotal: number;
  tax?: number;
  taxRate?: number;
  discount?: number;
  total: number;
  currency: string;
  issueDate: string;
  dueDate?: string;
  notes?: string;
}

export interface UpdateInvoiceRequest {
  invoiceNumber?: string;
  client?: InvoiceClient;
  items?: InvoiceItem[];
  subtotal?: number;
  tax?: number;
  taxRate?: number;
  discount?: number;
  total?: number;
  currency?: string;
  issueDate?: string;
  dueDate?: string;
  notes?: string;
  status?: 'draft' | 'generated' | 'sent' | 'paid';
}
