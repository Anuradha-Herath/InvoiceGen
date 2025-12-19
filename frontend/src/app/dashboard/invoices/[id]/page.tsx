'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { invoiceService } from '@/services/invoice';
import { Invoice } from '@/types/invoice';
import { InvoiceDetailPage } from '@/components/invoice/InvoiceDetailPage';

export default function InvoiceDetailPageWrapper() {
  const params = useParams();
  const invoiceId = params.id as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      const response = await invoiceService.list();
      const invoicesList = response.items || [];
      const foundInvoice = invoicesList.find((inv) => inv.id === invoiceId);

      if (foundInvoice) {
        setInvoice(foundInvoice);
      } else {
        toast.error('Invoice not found');
      }
    } catch (error: any) {
      console.error('Failed to fetch invoice:', error);
      toast.error('Failed to load invoice. Please ensure your backend is running.');
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
      <InvoiceDetailPage invoice={invoice} />
    </>
  );
}
