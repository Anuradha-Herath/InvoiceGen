import React, { useState, useEffect } from 'react';
import { Plus, Search, Download, Mail, Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { Invoice } from '@/types/invoice';
import { apiClient } from '@/services/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface InvoiceListPageProps {
  onNavigate?: (page: string) => void;
  invoices?: Invoice[];
  isLoading?: boolean;
}

interface PaginatedResponse {
  data: Invoice[];
  lastKey?: string;
  total?: number;
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
      const data: PaginatedResponse = response.data.data || { data: [] };

      setInvoices(data.data || []);
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
      const response = await apiClient.get(`/invoices/${invoice.id}/generate-pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invoice.invoiceNumber || 'invoice'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const handleSendEmail = async (invoice: Invoice) => {
    if (!invoice.id) {
      toast.error('Invoice ID missing');
      return;
    }

    try {
      await apiClient.post(`/invoices/${invoice.id}/send-email`);
      toast.success('Invoice sent successfully');
      fetchInvoices();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send invoice';
      toast.error(message);
    }
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
    </div>
  );
}
