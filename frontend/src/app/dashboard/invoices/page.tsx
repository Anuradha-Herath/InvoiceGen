'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { invoiceService } from '@/services/invoice';
import { Invoice } from '@/types/invoice';
import { mockInvoices } from '@/mocks/invoices';
import { InvoiceListPage } from '@/components/invoice/InvoiceListPage';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMockData, setIsMockData] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await invoiceService.list();
      const invoicesList = response.items || [];
      setInvoices(invoicesList);
      setIsMockData(false);
    } catch (error: any) {
      console.warn('Backend not available, using mock data');
      setInvoices(mockInvoices);
      setIsMockData(true);
      toast.success('Using mock data - Connect your backend to see real data', {
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isMockData && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            📋 <strong>Using mock data.</strong> Start your backend server to use real data.
          </p>
        </div>
      )}
      <InvoiceListPage invoices={invoices} isLoading={isLoading} />
    </>
  );
}
