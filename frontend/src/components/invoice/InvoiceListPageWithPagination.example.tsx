/**
 * Example Pagination Component for Invoice List
 * 
 * This is a reference implementation showing how to integrate cursor-based pagination
 * with the backend API. Copy and adapt to your project structure.
 */

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Invoice } from '@/types/invoice';
import { InvoicesTable } from '@/components/dashboard/InvoicesTable';
import { Button } from '@/components/ui/Button';

interface PaginationState {
  items: Invoice[];
  count: number;
  lastKey?: string;
}

export const InvoiceListPageWithPagination = () => {
  const [currentPage, setCurrentPage] = useState<PaginationState>({
    items: [],
    count: 0,
  });
  const [pageHistory, setPageHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);

  const pageSize = 10; // Items per page

  /**
   * Fetch invoices with pagination
   * @param lastKey - Base64 encoded cursor from previous response
   */
  const fetchInvoices = async (lastKey?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', pageSize.toString());
      if (lastKey) {
        params.append('lastKey', lastKey);
      }

      const response = await fetch(`/api/invoices?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch invoices');

      const data: PaginationState = await response.json();
      setCurrentPage(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load first page on mount
  useEffect(() => {
    fetchInvoices();
  }, []);

  /**
   * Navigate to next page
   * - Requires that current page has lastKey (meaning more data exists)
   * - Stores current lastKey in history for back navigation
   */
  const handleNextPage = () => {
    if (!currentPage.lastKey) return; // No more pages

    // Store current position in history
    const newHistory = [...pageHistory, currentPage.lastKey];
    setPageHistory(newHistory);

    // Fetch next page
    fetchInvoices(currentPage.lastKey);
    setPageNumber(pageNumber + 1);
  };

  /**
   * Navigate to previous page
   * - Uses stored lastKey from history
   * - If history is empty, goes to first page
   */
  const handlePreviousPage = () => {
    if (pageHistory.length === 0) {
      // Go to first page
      fetchInvoices();
      setPageNumber(0);
      setPageHistory([]);
      return;
    }

    // Get the lastKey from 2 pages back (previous page's cursor)
    const previousPageIndex = pageHistory.length - 1;
    const previousLastKey = previousPageIndex > 0 ? pageHistory[previousPageIndex - 1] : undefined;

    // Fetch previous page
    fetchInvoices(previousLastKey);
    setPageNumber(pageNumber - 1);

    // Update history
    setPageHistory(pageHistory.slice(0, previousPageIndex));
  };

  /**
   * Reset pagination to first page
   */
  const handleReset = () => {
    fetchInvoices();
    setPageNumber(0);
    setPageHistory([]);
  };

  // Determine if pagination buttons should be enabled
  const hasPreviousPage = pageHistory.length > 0;
  const hasNextPage = !!currentPage.lastKey; // Only if response included lastKey

  // Handler functions for the table
  const handleViewInvoice = (invoice: Invoice) => {
    console.log('View invoice:', invoice.id);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    console.log('Download invoice:', invoice.id);
  };

  const handleSendEmail = (invoice: Invoice) => {
    console.log('Send email for invoice:', invoice.id);
  };

  const handleViewAll = () => {
    handleReset();
  };

  return (
    <div className="space-y-6">
      {/* Table */}
      <InvoicesTable 
        invoices={currentPage.items} 
        isLoading={loading}
        onViewInvoice={handleViewInvoice}
        onDownloadInvoice={handleDownloadInvoice}
        onSendEmail={handleSendEmail}
        onViewAll={handleViewAll}
      />

      {/* Pagination Controls */}
      <div className="flex items-center justify-between border-t pt-4">
        <div className="text-sm text-gray-600">
          {currentPage.count > 0 ? (
            <>
              Showing <span className="font-semibold">{currentPage.items.length}</span> of{' '}
              <span className="font-semibold">{currentPage.count}</span> invoices on this page
            </>
          ) : (
            'No invoices found'
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Page Indicator */}
          <span className="text-sm text-gray-600 px-2">
            Page <span className="font-semibold">{pageNumber + 1}</span>
          </span>

          {/* Navigation Buttons */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreviousPage}
            disabled={!hasPreviousPage || loading}
            className="gap-2"
          >
            <ChevronLeft size={16} />
            Previous
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextPage}
            disabled={!hasNextPage || loading}
            className="gap-2"
          >
            Next
            <ChevronRight size={16} />
          </Button>

          {/* Reset Button */}
          {(pageHistory.length > 0 || currentPage.lastKey) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Debug Info (remove in production) */}
      <div className="hidden">
        <pre className="text-xs text-gray-500">
          {JSON.stringify({ pageNumber, historyLength: pageHistory.length, hasNextPage }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default InvoiceListPageWithPagination;
