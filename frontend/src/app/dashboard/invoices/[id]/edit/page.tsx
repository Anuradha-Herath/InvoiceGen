'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { invoiceService } from '@/services/invoice';
import { Invoice } from '@/types/invoice';
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
