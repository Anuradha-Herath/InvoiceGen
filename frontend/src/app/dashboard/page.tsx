'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { DollarSign, FileText, Clock, CheckCircle } from 'lucide-react';
import { invoiceService } from '@/services/invoice';
import { Invoice } from '@/types/invoice';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { InvoicesTable } from '@/components/dashboard/InvoicesTable';

export default function DashboardPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await invoiceService.list();
      const invoicesList = response.items || [];
      setInvoices(invoicesList);
      calculateStats(invoicesList);
    } catch (error: any) {
      console.error('Failed to fetch invoices:', error);
      toast.error('Failed to load invoices. Please ensure your backend is running.');
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (invoicesList: Invoice[]) => {
    const totalInvoices = invoicesList.length;
    const paidInvoices = invoicesList.filter((inv) => inv.status === 'paid').length;
    const pendingInvoices = invoicesList.filter((inv) => inv.status === 'sent' || inv.status === 'draft').length;
    const totalRevenue = invoicesList.reduce((sum, inv) => sum + inv.total, 0);

    setStats({
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      totalRevenue,
    });
  };

  const handleCreateInvoice = () => {
    router.push('/dashboard/invoices/new');
  };

  const handleViewInvoice = (invoice: Invoice) => {
    router.push(`/dashboard/invoices/${invoice.id}`);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    toast.success('Download feature coming soon');
  };

  const handleSendEmail = (invoice: Invoice) => {
    toast.success('Email feature coming soon');
  };

  const handleViewAll = () => {
    router.push('/dashboard/invoices');
  };

  const statsData = [
    {
      label: 'Total Invoices',
      value: stats.totalInvoices.toString(),
      icon: FileText,
      color: 'bg-blue-600',
    },
    {
      label: 'Paid Invoices',
      value: stats.paidInvoices.toString(),
      icon: CheckCircle,
      color: 'bg-green-600',
    },
    {
      label: 'Pending',
      value: stats.pendingInvoices.toString(),
      icon: Clock,
      color: 'bg-amber-600',
    },
    {
      label: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-indigo-600',
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <DashboardHeader onCreateInvoice={handleCreateInvoice} />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat, index) => (
            <StatCard
              key={index}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

        {/* Recent Invoices Table */}
        <InvoicesTable
          invoices={invoices}
          onViewInvoice={handleViewInvoice}
          onDownloadInvoice={handleDownloadInvoice}
          onSendEmail={handleSendEmail}
          onViewAll={handleViewAll}
          isLoading={isLoading}
        />
      </div>
    </main>
  );
}
