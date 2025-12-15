import React, { useState } from 'react';
import { Plus, Search, Download, Mail, Eye, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { Invoice } from '@/types/invoice';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface InvoiceListPageProps {
  invoices: Invoice[];
  isLoading?: boolean;
}

export function InvoiceListPage({ invoices, isLoading = false }: InvoiceListPageProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.invoiceNumber && invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;

    let matchesDateRange = true;
    if (startDate) {
      matchesDateRange = matchesDateRange && invoice.issueDate >= startDate;
    }
    if (endDate) {
      matchesDateRange = matchesDateRange && invoice.issueDate <= endDate;
    }

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  const handleCreateInvoice = () => {
    router.push('/dashboard/invoices/new');
  };

  const handleViewInvoice = (invoice: Invoice) => {
    router.push(`/dashboard/invoices/${invoice.id}`);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    router.push(`/dashboard/invoices/${invoice.id}/edit`);
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    toast.success('PDF download feature coming soon');
  };

  const handleSendEmail = (invoice: Invoice) => {
    toast.success('Email sending feature coming soon');
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    if (confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
      toast.success('Invoice deleted successfully');
    }
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No invoices found</p>
              {invoices.length === 0 ? (
                <Button onClick={handleCreateInvoice}>Create your first invoice</Button>
              ) : (
                <p className="text-sm text-gray-400">Try adjusting your filters</p>
              )}
            </div>
          ) : (
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
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <span className="text-blue-600 font-medium">
                          {invoice.invoiceNumber || `INV-${invoice.id.slice(0, 8).toUpperCase()}`}
                        </span>
                      </TableCell>
                      <TableCell>{invoice.client.name}</TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {invoice.currency} {invoice.total.toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewInvoice(invoice)}
                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-all"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditInvoice(invoice)}
                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(invoice)}
                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-all"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSendEmail(invoice)}
                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-all"
                            title="Send Email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(invoice)}
                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded transition-all"
                            title="Delete"
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
