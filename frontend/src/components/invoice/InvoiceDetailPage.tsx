import React, { useState } from 'react';
import { ArrowLeft, Download, Mail, Edit2, FileText } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Invoice } from '@/types/invoice';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { invoiceService } from '@/services/invoice';

interface InvoiceDetailPageProps {
  invoice: Invoice;
}

export function InvoiceDetailPage({ invoice }: InvoiceDetailPageProps) {
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSending, setIsSending] = useState(false);

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

  const handleEdit = () => {
    router.push(`/dashboard/invoices/${invoice.id}/edit`);
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const result = await invoiceService.generatePDF(invoice.id);
      if (result.pdfUrl) {
        window.open(result.pdfUrl, '_blank');
        toast.success('PDF generated successfully');
      }
    } catch (error: any) {
      console.error('Failed to generate PDF:', error);
      toast.error(error.response?.data?.message || 'Failed to generate PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSend = async () => {
    try {
      setIsSending(true);
      const email = prompt('Enter recipient email address:');
      if (!email) return;
      
      const message = prompt('Enter message (optional):');
      await invoiceService.emailInvoice(invoice.id, email, message || undefined);
      toast.success('Invoice sent successfully');
    } catch (error: any) {
      console.error('Failed to send invoice:', error);
      toast.error(error.response?.data?.message || 'Failed to send invoice');
    } finally {
      setIsSending(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Use actual invoice data instead of calculating
  const subtotal = invoice.subtotal || 0;
  const taxAmount = invoice.tax || 0;
  const discountAmount = invoice.discount || 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                Invoice {invoice.invoiceNumber || invoice.id}
              </h1>
              {getStatusBadge(invoice.status)}
            </div>
            <p className="text-gray-600 mt-1">Invoice details and preview</p>
          </div>
        </div>
        <div className="flex gap-2 flex-col sm:flex-row">
          <Button variant="ghost" size="sm" onClick={handleEdit}>
            <Edit2 className="w-4 h-4" />
            Edit
          </Button>
          <Button variant="secondary" size="sm" onClick={handleDownload} disabled={isDownloading}>
            <Download className="w-4 h-4" />
            {isDownloading ? 'Generating...' : 'Download'}
          </Button>
          <Button size="sm" onClick={handleSend} disabled={isSending}>
            <Mail className="w-4 h-4" />
            {isSending ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>

      {/* Invoice Preview */}
      <Card className="print:shadow-none">
        <CardContent className="pt-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">InvoiceGen</span>
              </div>
              <p className="text-sm text-gray-600">
                Your Company Name<br />
                456 Business Rd<br />
                San Francisco, CA 94102<br />
                contact@invoicegen.com
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-gray-900 font-bold mb-2 text-lg">INVOICE</h2>
              <p className="text-sm text-gray-600">
                <strong>Invoice #:</strong> {invoice.invoiceNumber || invoice.id}<br />
                {invoice.issueDate && (
                  <>
                    <strong>Issue Date:</strong> {new Date(invoice.issueDate).toLocaleDateString()}<br />
                  </>
                )}
                {invoice.dueDate && (
                  <>
                    <strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">BILL TO</h3>
            <p className="text-gray-900">
              <strong>{invoice.client.name}</strong><br />
              {invoice.client.address && <>{invoice.client.address}<br /></>}
              {invoice.client.email && <>{invoice.client.email}<br /></>}
              {invoice.client.phone && <>{invoice.client.phone}</>}
            </p>
          </div>

          {/* Items Table */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 text-sm font-semibold text-gray-600">
                    Description
                  </th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-600">Qty</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-600">
                    Unit Price
                  </th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items && invoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-3 text-gray-900">{item.description}</td>
                    <td className="py-3 text-right text-gray-900">{item.quantity}</td>
                    <td className="py-3 text-right text-gray-900">
                      {invoice.currency} {item.unitPrice.toFixed(2)}
                    </td>
                    <td className="py-3 text-right text-gray-900">
                      {invoice.currency} {(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex justify-end">
            <div className="w-full sm:w-80 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>
                  {invoice.currency} {subtotal.toFixed(2)}
                </span>
              </div>
              {invoice.taxRate ? (
                <div className="flex justify-between text-gray-600">
                  <span>Tax ({invoice.taxRate}%):</span>
                  <span>
                    {invoice.currency} {taxAmount.toFixed(2)}
                  </span>
                </div>
              ) : null}
              {discountAmount > 0 ? (
                <div className="flex justify-between text-gray-600">
                  <span>Discount ({invoice.discount || 0}%):</span>
                  <span>
                    -{invoice.currency} {(subtotal * (invoice.discount || 0) / 100).toFixed(2)}
                  </span>
                </div>
              ) : null}
              <div className="border-t-2 border-gray-300 pt-2 flex justify-between text-gray-900 font-semibold">
                <span>Total:</span>
                <span className="text-blue-600 text-lg">
                  {invoice.currency} {invoice.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-8 pt-8 border-t border-gray-300">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">NOTES</h3>
              <p className="text-sm text-gray-600">{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-gray-300 text-center text-xs text-gray-500">
            <p>Thank you for your business!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
