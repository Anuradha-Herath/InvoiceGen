import React, { useState, useEffect } from 'react';
import { Plus, Search, Download, Mail, Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { Invoice } from '@/types/invoice';
import { apiClient } from '@/services/api';
import { invoiceService } from '@/services/invoice';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface InvoiceListPageProps {
  onNavigate?: (page: string) => void;
  invoices?: Invoice[];
  isLoading?: boolean;
}

interface PaginatedResponse {
  items: Invoice[];
  lastKey?: string;
  count?: number;
}

export function InvoiceListPage({ onNavigate, invoices: initialInvoices, isLoading: initialIsLoading }: InvoiceListPageProps) {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices || []);
  const [isLoading, setIsLoading] = useState(initialIsLoading !== undefined ? initialIsLoading : true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageStack, setPageStack] = useState<string[]>(['']);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [emailData, setEmailData] = useState({
    recipientEmail: '',
    message: '',
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Paid</Badge>;
      case 'sent':
        return <Badge variant="warning">Sent</Badge>;
      case 'draft':
        return <Badge>Draft</Badge>;
      case 'generated':
        return <Badge variant="warning">Generated</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Load invoices on mount and when filters change
  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, pageSize]);

  const fetchInvoices = async (lastKey?: string) => {
    setIsLoading(true);
    try {
      const params: any = {
        limit: pageSize,
      };

      if (lastKey) {
        params.lastKey = lastKey;
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await apiClient.get('/invoices', { params });
      const data = response.data || { items: [] };

      setInvoices(data.items || []);
      setHasNextPage(!!data.lastKey);
    } catch (error) {
      console.error('Failed to load invoices:', error);
      toast.error('Failed to load invoices');
      setInvoices([]);
      setHasNextPage(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvoice = () => {
    router.push('/dashboard/invoices/new');
  };

  const handleViewInvoice = (invoice: Invoice) => {
    router.push(`/dashboard/invoices/${invoice.id}`);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    router.push(`/dashboard/invoices/${invoice.id}/edit`);
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    if (!invoice.id) {
      toast.error('Invoice ID missing');
      return;
    }

    try {
      const result = await invoiceService.generatePDF(invoice.id);
      if (result.pdfUrl) {
        window.open(result.pdfUrl, '_blank');
        toast.success('PDF generated successfully');
      }
    } catch (error: any) {
      console.error('Failed to generate PDF:', error);
      toast.error(error.response?.data?.message || 'Failed to generate PDF');
    }
  };

  const handleSendEmail = (invoice: Invoice) => {
    if (!invoice.id) {
      toast.error('Invoice ID missing');
      return;
    }
    setSelectedInvoice(invoice);
    setEmailData({
      recipientEmail: invoice.client.email || '',
      message: '',
    });
    setShowEmailModal(true);
  };

  const handleSendEmailSubmit = async () => {
    if (!selectedInvoice?.id) return;

    if (!emailData.recipientEmail) {
      toast.error('Please enter a recipient email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.recipientEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setIsSending(true);
      await invoiceService.emailInvoice(
        selectedInvoice.id,
        emailData.recipientEmail,
        emailData.message || undefined
      );
      toast.success('Invoice sent successfully');
      setShowEmailModal(false);
      setEmailData({ recipientEmail: '', message: '' });
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send invoice';
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseEmailModal = () => {
    setShowEmailModal(false);
    setEmailData({ recipientEmail: '', message: '' });
    setSelectedInvoice(null);
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    if (!invoice.id) {
      toast.error('Invoice ID missing');
      return;
    }

    if (confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
      try {
        await apiClient.delete(`/invoices/${invoice.id}`);
        toast.success('Invoice deleted successfully');
        fetchInvoices();
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to delete invoice';
        toast.error(message);
      }
    }
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (hasNextPage && invoices.length > 0) {
      const lastInvoice = invoices[invoices.length - 1];
      const newLastKey = lastInvoice.id;
      setPageStack([...pageStack, newLastKey]);
      setCurrentPage(currentPage + 1);
      fetchInvoices(newLastKey);
    }
  };

  const handlePreviousPage = () => {
    if (pageStack.length > 1) {
      const newStack = pageStack.slice(0, -1);
      setPageStack(newStack);
      setCurrentPage(currentPage - 1);
      const previousKey = newStack[newStack.length - 1];
      fetchInvoices(previousKey);
    }
  };

  const handleResetPagination = () => {
    setPageStack(['']);
    setCurrentPage(1);
    fetchInvoices();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">Manage all your invoices</p>
        </div>
        <Button onClick={handleCreateInvoice}>
          <Plus className="w-4 h-4" />
          Create Invoice
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input
              placeholder="Search by client or invoice ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
            <Select
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'paid', label: 'Paid' },
                { value: 'sent', label: 'Sent' },
                { value: 'draft', label: 'Draft' },
                { value: 'generated', label: 'Generated' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            <Input
              type="date"
              placeholder="Start date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              label="From"
            />
            <Input
              type="date"
              placeholder="End date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              label="To"
            />
            <Select
              options={[
                { value: '10', label: '10 per page' },
                { value: '25', label: '25 per page' },
                { value: '50', label: '50 per page' },
              ]}
              value={pageSize.toString()}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value));
                handleResetPagination();
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading invoices...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No invoices found</p>
              <Button onClick={handleCreateInvoice}>Create your first invoice</Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <span className="text-blue-600 font-medium">
                            {invoice.invoiceNumber || `INV-${invoice.id.slice(0, 8).toUpperCase()}`}
                          </span>
                        </TableCell>
                        <TableCell>{invoice.client?.name || 'N/A'}</TableCell>
                        <TableCell className="text-gray-600">
                          {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="font-medium">
                          {invoice.currency} {invoice.total?.toFixed(2) || '0.00'}
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleViewInvoice(invoice)}
                              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-all disabled:opacity-50"
                              title="View"
                              disabled={isLoading}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditInvoice(invoice)}
                              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-all disabled:opacity-50"
                              title="Edit"
                              disabled={isLoading}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadPDF(invoice)}
                              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-all disabled:opacity-50"
                              title="Download PDF"
                              disabled={isLoading}
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleSendEmail(invoice)}
                              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-all disabled:opacity-50"
                              title="Send Email"
                              disabled={isLoading}
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteInvoice(invoice)}
                              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded transition-all disabled:opacity-50"
                              title="Delete"
                              disabled={isLoading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <div className="text-sm text-gray-600">
                  Page <span className="font-semibold">{currentPage}</span> • Showing{' '}
                  <span className="font-semibold">{invoices.length}</span> invoices
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={pageStack.length <= 1 || isLoading}
                    className="gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!hasNextPage || isLoading}
                    className="gap-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetPagination}
                    disabled={currentPage === 1 || isLoading}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Email Modal */}
      <Modal
        isOpen={showEmailModal}
        onClose={handleCloseEmailModal}
        title="Send Invoice via Email"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={handleCloseEmailModal} disabled={isSending}>
              Cancel
            </Button>
            <Button onClick={handleSendEmailSubmit} disabled={isSending}>
              {isSending ? 'Sending...' : 'Send Email'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Recipient Email"
            type="email"
            placeholder="customer@example.com"
            value={emailData.recipientEmail}
            onChange={(e) =>
              setEmailData({ ...emailData, recipientEmail: e.target.value })
            }
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Message (Optional)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows={4}
              placeholder="Enter a custom message for the email..."
              value={emailData.message}
              onChange={(e) =>
                setEmailData({ ...emailData, message: e.target.value })
              }
            />
          </div>
          <p className="text-sm text-gray-500">
            The invoice PDF will be sent to the customer.
          </p>
        </div>
      </Modal>
    </div>
  );
}
