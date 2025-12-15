'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { invoiceService } from '@/services/invoice';
import { authService } from '@/services/auth';
import { Invoice } from '@/types/invoice';
import { format } from 'date-fns';

export default function DashboardPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication first
    const authenticated = authService.isAuthenticated();
    if (!authenticated) {
      router.push('/auth/login');
      return;
    }
    setIsAuthenticated(true);
    fetchInvoices();
  }, [router]);

  const fetchInvoices = async () => {
    try {
      const response = await invoiceService.list();
      setInvoices(response.items);
      setIsLoading(false);
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        toast.error('Failed to connect to server. Make sure the backend is running on port 3001');
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        router.push('/auth/login');
      } else {
        toast.error(error.response?.data?.error || 'Failed to load invoices');
      }
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      generated: 'bg-blue-100 text-blue-800',
      sent: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-gray-900">Invoice Generator</h1>
            <div className="flex gap-4">
              <Link
                href="/dashboard/invoices/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                New Invoice
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Invoices</h2>

          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No invoices yet</p>
              <Link
                href="/dashboard/invoices/new"
                className="text-blue-600 hover:text-blue-700"
              >
                Create your first invoice
              </Link>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <li key={invoice.id}>
                    <Link
                      href={`/dashboard/invoices/${invoice.id}`}
                      className="block hover:bg-gray-50 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-blue-600 truncate">
                              {invoice.invoiceNumber || `Invoice #${invoice.id.slice(0, 8)}`}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                                {invoice.status}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                {invoice.client.name}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <p>
                                {invoice.currency} {invoice.total.toFixed(2)}
                              </p>
                              <p className="ml-4">
                                {format(new Date(invoice.issueDate), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
