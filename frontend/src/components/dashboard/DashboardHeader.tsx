import React from 'react';
import { Button } from '../ui/Button';
import { Plus } from 'lucide-react';

interface DashboardHeaderProps {
  onCreateInvoice: () => void;
}

export function DashboardHeader({ onCreateInvoice }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here&apos;s your overview</p>
      </div>
      <Button onClick={onCreateInvoice} size="md">
        <Plus className="w-4 h-4" />
        Create Invoice
      </Button>
    </div>
  );
}
