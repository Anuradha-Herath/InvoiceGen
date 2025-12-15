import React from 'react';
import { Eye, Download, Mail } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { Button } from '../ui/Button';
import { Invoice } from '@/types/invoice';
import { format } from 'date-fns';

interface InvoicesTableProps {
  invoices: Invoice[];
  onViewInvoice: (invoice: Invoice) => void;
  onDownloadInvoice: (invoice: Invoice) => void;
  onSendEmail: (invoice: Invoice) => void;
  onViewAll: () => void;
  isLoading?: boolean;
}

export function InvoicesTable({
  invoices,
  onViewInvoice,
  onDownloadInvoice,
  onSendEmail,
  onViewAll,
  isLoading = false,
}: InvoicesTableProps) {
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center text-gray-500">
          Loading invoices...
        </CardContent>
      </Card>
    );
  }

  if (invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500 mb-4">No invoices yet</p>
          <p className="text-sm text-gray-400">Create your first invoice to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Invoices</CardTitle>
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View all
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.slice(0, 5).map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <span className="text-blue-600 font-medium">
                      {invoice.invoiceNumber || `INV-${invoice.id.slice(0, 8).toUpperCase()}`}
                    </span>
                  </TableCell>
                  <TableCell>{invoice.client.name}</TableCell>
                  <TableCell className="font-medium">
                    {invoice.currency} {invoice.total.toFixed(2)}
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-gray-600">
                    {format(new Date(invoice.issueDate), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onViewInvoice(invoice)}
                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-all"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDownloadInvoice(invoice)}
                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-all"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onSendEmail(invoice)}
                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-all"
                        title="Send Email"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
