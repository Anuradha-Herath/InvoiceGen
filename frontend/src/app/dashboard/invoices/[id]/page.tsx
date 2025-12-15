'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { invoiceService } from '@/services/invoice';
import { Invoice } from '@/types/invoice';
import { mockInvoices } from '@/mocks/invoices';
import { InvoiceDetailPage } from '@/components/invoice/InvoiceDetailPage';

export default function InvoiceDetailPageWrapper() {
  const params = useParams();
  const invoiceId = params.id as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMockData, setIsMockData] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      // Try to fetch from API first
      const response = await invoiceService.list();
      const invoicesList = response.items || [];
      const foundInvoice = invoicesList.find((inv) => inv.id === invoiceId);

      if (foundInvoice) {
        setInvoice(foundInvoice);
        setIsMockData(false);
      } else {
        throw new Error('Invoice not found');
      }
    } catch (error: any) {
      console.warn('Backend not available, using mock data');
      // Fall back to mock data
      const mockInvoice = mockInvoices.find((inv) => inv.id === invoiceId);

      if (mockInvoice) {
        setInvoice(mockInvoice);
        setIsMockData(true);
        toast.success('Using mock data', {
          duration: 3000,
        });
      } else {
        toast.error('Invoice not found');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-600">Loading invoice...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-600">Invoice not found</p>
      </div>
    );
  }

  return (
    <>
      {isMockData && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            📋 <strong>Using mock data.</strong> Start your backend server to use real data.
          </p>
        </div>
      )}
      <InvoiceDetailPage invoice={invoice} />
    </>
  );
}
