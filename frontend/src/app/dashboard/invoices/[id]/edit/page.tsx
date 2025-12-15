'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { invoiceService } from '@/services/invoice';
import { Invoice } from '@/types/invoice';
import { mockInvoices } from '@/mocks/invoices';
import { CreateInvoice } from '@/components/invoice/CreateInvoice';

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      } else {
        throw new Error('Invoice not found');
      }
    } catch (error: any) {
      console.warn('Backend not available, using mock data');
      // Fall back to mock data
      const mockInvoice = mockInvoices.find((inv) => inv.id === invoiceId);

      if (mockInvoice) {
        setInvoice(mockInvoice);
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

  const handleBack = () => {
    router.back();
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

  return <CreateInvoice invoice={invoice} isEditing={true} onBack={handleBack} />;
}
