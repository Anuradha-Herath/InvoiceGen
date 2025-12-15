'use client';

import { useRouter } from 'next/navigation';
import { CreateInvoice } from '@/components/invoice/CreateInvoice';

export default function CreateInvoicePage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return <CreateInvoice onBack={handleBack} />;
}
