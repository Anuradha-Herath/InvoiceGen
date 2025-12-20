import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft, Download, Mail } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Invoice } from '@/types/invoice';
import { apiClient } from '@/services/api';
import toast from 'react-hot-toast';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount?: number;
}

interface CreateInvoiceProps {
  onBack: () => void;
  invoice?: Invoice;
  isEditing?: boolean;
}

interface CreateInvoicePayload {
  invoiceNumber?: string;
  issueDate: string;
  dueDate?: string;
  currency: string;
  client: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    address?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  subtotal: number;
  tax?: number;
  taxRate?: number;
  discount?: number;
  total: number;
  notes?: string;
  status?: 'draft' | 'generated' | 'sent' | 'paid';
}

export function CreateInvoice({ onBack, invoice, isEditing = false }: CreateInvoiceProps) {
  const [invoiceNumber, setInvoiceNumber] = useState('INV-' + Math.floor(Math.random() * 10000));
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [currency, setCurrency] = useState('USD');

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0 },
  ]);

  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Array<{ id: string; name: string; email: string; phone?: string; company?: string; address?: string }>>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  // Load clients on mount
  useEffect(() => {
    const loadClients = async () => {
      try {
        const response = await apiClient.get('/clients');
        setClients(response.data.items || []);
      } catch (error) {
        console.error('Failed to load clients:', error);
      }
    };
    loadClients();
  }, []);

  // Helper function to format date from ISO to yyyy-MM-dd
  const formatDateInput = (dateString: string | undefined): string => {
    if (!dateString) return '';
    // If it's already in yyyy-MM-dd format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    // If it's in ISO format, extract just the date part
    return dateString.split('T')[0];
  };

  useEffect(() => {
    if (invoice && isEditing) {
      setInvoiceNumber(invoice.invoiceNumber || '');
      setIssueDate(formatDateInput(invoice.issueDate));
      setDueDate(formatDateInput(invoice.dueDate || ''));
      setCurrency(invoice.currency || 'USD');
      setClientName(invoice.client?.name || '');
      setClientEmail(invoice.client?.email || '');
      setClientPhone(invoice.client?.phone || '');
      setClientAddress(invoice.client?.address || '');
      
      const mappedItems = invoice.items.map((item) => ({
        id: Math.random().toString(),
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.quantity * item.unitPrice,
      }));
      setItems(mappedItems);
      
      setTaxRate(invoice.taxRate || 0);
      setDiscount(invoice.discount || 0);
      setNotes(invoice.notes || '');
    }
  }, [invoice, isEditing]);

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const discountAmount = Math.round(subtotal * (discount / 100) * 100) / 100;
  const total = Math.round((subtotal + taxAmount - discountAmount) * 100) / 100;

  // Helper function to add client from modal
  const handleSelectClient = (client: any) => {
    setClientName(client.name);
    setClientEmail(client.email);
    setClientPhone(client.phone || '');
    setClientAddress(client.address || '');
    setSelectedClientId(client.id);
  };

  // Create payload for API
  const createInvoicePayload = (): CreateInvoicePayload => {
    // Convert yyyy-MM-dd format to ISO date format (required by backend)
    const formatDateForBackend = (dateString: string): string | undefined => {
      if (!dateString) return undefined;
      // If it's in yyyy-MM-dd format, convert to ISO
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return new Date(dateString + 'T00:00:00.000Z').toISOString();
      }
      // If it's already in ISO format, return as is
      if (dateString.includes('T')) {
        return dateString;
      }
      // Fallback: try to parse and convert
      return new Date(dateString).toISOString();
    };

    const payload: any = {
      invoiceNumber: invoiceNumber || undefined,
      issueDate: formatDateForBackend(issueDate),
      dueDate: formatDateForBackend(dueDate),
      currency,
      client: {
        name: clientName,
        email: clientEmail,
        phone: clientPhone || undefined,
        address: clientAddress || undefined,
      },
      items: items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: Math.round(item.quantity * item.unitPrice * 100) / 100,
      })),
      subtotal,
      tax: taxAmount,
      taxRate: taxRate || undefined,
      discount: discount || undefined,
      total,
      notes: notes || undefined,
    };

    // Remove undefined and null values to avoid validation errors
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined || payload[key] === null) {
        delete payload[key];
      }
    });

    // Clean up nested client object to remove undefined values
    if (payload.client) {
      Object.keys(payload.client).forEach((key) => {
        if (payload.client[key] === undefined || payload.client[key] === null) {
          delete payload.client[key];
        }
      });
    }

    return payload;
  };

  const handleSaveDraft = async () => {
    if (!clientName) {
      toast.error('Please enter client name');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = createInvoicePayload();
      if (isEditing && invoice?.id) {
        await apiClient.put(`/invoices/${invoice.id}`, payload);
        toast.success('Invoice updated successfully!');
      } else {
        const response = await apiClient.post('/invoices', payload);
        toast.success('Invoice saved as draft!');
      }
      onBack();
    } catch (error: any) {
      const errorData = error.response?.data;
      let message = 'Failed to save invoice';
      
      if (typeof errorData === 'string') {
        message = errorData;
      } else if (errorData?.error) {
        message = errorData.error;
      } else if (errorData?.message) {
        message = errorData.message;
      } else if (error.message) {
        message = error.message;
      }
      
      console.error('Save invoice error details:', {
        status: error.response?.status,
        data: errorData,
        message: message
      });
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!clientName) {
      toast.error('Please fill in client information');
      return;
    }

    if (items.some((item) => !item.description || item.unitPrice === 0)) {
      toast.error('Please fill in all item details');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = createInvoicePayload();
      
      let invoiceId = invoice?.id;
      
      // Save invoice first if creating new
      if (!isEditing) {
        const response = await apiClient.post('/invoices', payload);
        invoiceId = response.data.id;
      } else {
        // Update existing invoice (without changing status yet)
        await apiClient.put(`/invoices/${invoice.id}`, payload);
      }
      
      // Then generate PDF
      if (invoiceId) {
        await apiClient.post(`/invoices/${invoiceId}/pdf`);
      }
      
      toast.success('PDF generated successfully!');
      onBack();
    } catch (error: any) {
      const message = error.response?.data?.message || error.response?.data?.error || 'Failed to generate PDF';
      console.error('Generate PDF error:', error.response?.data || error);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!clientEmail) {
      toast.error('Please enter client email');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = createInvoicePayload();
      
      let invoiceId = invoice?.id;
      
      // Save invoice first if creating new
      if (!isEditing) {
        const response = await apiClient.post('/invoices', payload);
        invoiceId = response.data.id;
      } else {
        // Update existing invoice
        await apiClient.put(`/invoices/${invoice.id}`, payload);
      }
      
      // Then send email
      if (invoiceId) {
        await apiClient.post(`/invoices/${invoiceId}/email`);
      }
      
      toast.success('Invoice sent successfully!');
      onBack();
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to send invoice';
      console.error('Send invoice error:', error.response?.data || error);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Invoice' : 'Create Invoice'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing
              ? 'Update the invoice details'
              : 'Fill in the details to create a new invoice'}
          </p>
        </div>
      </div>

      {/* Invoice Information */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Invoice Number" value={invoiceNumber} disabled />
            <Input
              label="Issue Date"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
            <Input
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <Select
              label="Currency"
              options={[
                { value: 'USD', label: 'USD ($)' },
                { value: 'EUR', label: 'EUR (€)' },
                { value: 'GBP', label: 'GBP (£)' },
                { value: 'LKR', label: 'LKR (₨)' },
              ]}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle>Bill To (Client Information)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Select Existing Client (Optional)
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={selectedClientId}
                onChange={(e) => {
                  const client = clients.find((c) => c.id === e.target.value);
                  if (client) {
                    handleSelectClient(client);
                    setSelectedClientId(e.target.value);
                  }
                }}
              >
                <option value="">-- Choose a client --</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Client Name"
              placeholder="Acme Corporation"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              placeholder="client@example.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
            <Input
              label="Phone"
              placeholder="+1 (555) 000-0000"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
            />
            <Input
              label="Address"
              placeholder="123 Main St, City, State, ZIP"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoice Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invoice Items</CardTitle>
            <Button size="sm" onClick={addItem}>
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-5">
                    <Input
                      label={index === 0 ? 'Description' : ''}
                      placeholder="Service or product description"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      label={index === 0 ? 'Quantity' : ''}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)
                      }
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Input
                      label={index === 0 ? 'Unit Price' : ''}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="md:col-span-2 flex items-end">
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all w-full md:w-auto"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-3 text-right text-sm text-gray-600 font-medium">
                  Total: {currency} {(item.quantity * item.unitPrice).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Input
                label="Tax (%)"
                type="number"
                min="0"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              />
              <Input
                label="Discount (%)"
                type="number"
                min="0"
                step="0.1"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Notes
                </label>
                <textarea
                  placeholder="Add any additional notes for the invoice..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  rows={3}
                />
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Subtotal:</span>
                <span>
                  {currency} {subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Tax ({taxRate}%):</span>
                <span>
                  {currency} {taxAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Discount ({discount}%):</span>
                <span>
                  -{currency} {discountAmount.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between text-gray-900 font-semibold">
                <span>Grand Total:</span>
                <span className="text-blue-600 text-lg">
                  {currency} {total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button variant="ghost" onClick={onBack}>
          Cancel
        </Button>
        <Button
          variant="secondary"
          onClick={handleSaveDraft}
          disabled={isSubmitting}
        >
          {isEditing ? 'Save Changes' : 'Save as Draft'}
        </Button>
        <Button
          onClick={handleGeneratePDF}
          disabled={isSubmitting}
        >
          <Download className="w-4 h-4" />
          Generate PDF
        </Button>
        <Button
          onClick={handleSendInvoice}
          disabled={isSubmitting}
        >
          <Mail className="w-4 h-4" />
          Send Invoice
        </Button>
      </div>
    </div>
  );
}
