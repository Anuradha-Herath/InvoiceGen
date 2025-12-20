/**
 * Example Zustand Store for Invoice Pagination
 * 
 * This demonstrates how to manage pagination state in a reusable way.
 * Reference implementation - customize as needed for your project.
 */

import { create } from 'zustand';
import { Invoice } from '@/types/invoice';

interface PaginationMeta {
  currentPage: number;
  pageStack: string[]; // Array of lastKeys for navigation
  pageSize: number;
  totalItems: number;
}

interface InvoiceListStore {
  // State
  invoices: Invoice[];
  pagination: PaginationMeta;
  loading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
  goToFirstPage: () => Promise<void>;
  setPageSize: (size: number) => void;
  reset: () => void;

  // Computed
  hasNextPage: () => boolean;
  hasPreviousPage: () => boolean;
}

const DEFAULT_PAGE_SIZE = 10;

// Helper to encode/decode pagination keys
const encodeKey = (key: any): string => {
  return Buffer.from(JSON.stringify(key)).toString('base64');
};

const decodeKey = (encoded: string): any => {
  try {
    return JSON.parse(Buffer.from(encoded, 'base64').toString('utf-8'));
  } catch {
    return undefined;
  }
};

export const useInvoiceListStore = create<InvoiceListStore>((set, get) => ({
  // Initial state
  invoices: [],
  pagination: {
    currentPage: 0,
    pageStack: [],
    pageSize: DEFAULT_PAGE_SIZE,
    totalItems: 0,
  },
  loading: false,
  error: null,

  // Initialize - fetch first page
  initialize: async () => {
    set({ loading: true, error: null });
    try {
      const { pagination } = get();
      const params = new URLSearchParams({
        limit: pagination.pageSize.toString(),
      });

      const response = await fetch(`/api/invoices?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch invoices');

      const data = await response.json();

      set({
        invoices: data.items,
        pagination: {
          ...get().pagination,
          totalItems: data.count,
          currentPage: 0,
          pageStack: [],
        },
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.message,
        loading: false,
      });
    }
  },

  // Navigate to next page
  nextPage: async () => {
    const { invoices, pagination } = get();

    // Check if we can go to next page (should have a lastKey)
    if (!invoices.length) return;

    // Create a key for current position
    const currentLastKey = invoices[invoices.length - 1];
    if (!currentLastKey) return;

    set({ loading: true, error: null });
    try {
      const newStack = [...pagination.pageStack, encodeKey(currentLastKey)];
      const lastKeyToUse = encodeKey(currentLastKey);

      const params = new URLSearchParams({
        limit: pagination.pageSize.toString(),
        lastKey: lastKeyToUse,
      });

      const response = await fetch(`/api/invoices?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch invoices');

      const data = await response.json();

      if (data.items.length > 0) {
        set({
          invoices: data.items,
          pagination: {
            ...pagination,
            currentPage: pagination.currentPage + 1,
            pageStack: newStack,
            totalItems: data.count,
          },
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (error: any) {
      set({
        error: error.message,
        loading: false,
      });
    }
  },

  // Navigate to previous page
  previousPage: async () => {
    const { pagination } = get();

    if (pagination.pageStack.length === 0) {
      // Go to first page
      await get().goToFirstPage();
      return;
    }

    set({ loading: true, error: null });
    try {
      // Get the key from 2 positions back (for previous page)
      const previousPageIndex = pagination.pageStack.length - 1;
      const previousLastKey =
        previousPageIndex > 0 ? pagination.pageStack[previousPageIndex - 1] : undefined;

      const params = new URLSearchParams({
        limit: pagination.pageSize.toString(),
      });

      if (previousLastKey) {
        params.append('lastKey', previousLastKey);
      }

      const response = await fetch(`/api/invoices?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch invoices');

      const data = await response.json();

      set({
        invoices: data.items,
        pagination: {
          ...pagination,
          currentPage: pagination.currentPage - 1,
          pageStack: pagination.pageStack.slice(0, previousPageIndex),
        },
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.message,
        loading: false,
      });
    }
  },

  // Go to first page
  goToFirstPage: async () => {
    set({ loading: true, error: null });
    try {
      const { pagination } = get();
      const params = new URLSearchParams({
        limit: pagination.pageSize.toString(),
      });

      const response = await fetch(`/api/invoices?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch invoices');

      const data = await response.json();

      set({
        invoices: data.items,
        pagination: {
          ...pagination,
          currentPage: 0,
          pageStack: [],
          totalItems: data.count,
        },
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.message,
        loading: false,
      });
    }
  },

  // Set page size and reset to first page
  setPageSize: (size: number) => {
    set((state) => ({
      pagination: {
        ...state.pagination,
        pageSize: Math.min(Math.max(size, 1), 100), // Clamp 1-100
      },
    }));
    // Refetch with new page size
    get().goToFirstPage();
  },

  // Reset to initial state
  reset: () => {
    set({
      invoices: [],
      pagination: {
        currentPage: 0,
        pageStack: [],
        pageSize: DEFAULT_PAGE_SIZE,
        totalItems: 0,
      },
      loading: false,
      error: null,
    });
  },

  // Computed properties
  hasNextPage: () => {
    // Backend sends lastKey only if more items exist
    // We can infer this by checking if we received a full page
    const { invoices, pagination } = get();
    return invoices.length === pagination.pageSize;
  },

  hasPreviousPage: () => {
    const { pagination } = get();
    return pagination.pageStack.length > 0;
  },
}));

/**
 * Usage in component:
 * 
 * const InvoiceListPage = () => {
 *   const {
 *     invoices,
 *     pagination,
 *     loading,
 *     initialize,
 *     nextPage,
 *     previousPage,
 *     hasNextPage,
 *     hasPreviousPage,
 *   } = useInvoiceListStore();
 * 
 *   useEffect(() => {
 *     initialize();
 *   }, []);
 * 
 *   return (
 *     <>
 *       <InvoicesTable invoices={invoices} />
 *       <button onClick={previousPage} disabled={!hasPreviousPage()}>
 *         Previous
 *       </button>
 *       <span>Page {pagination.currentPage + 1}</span>
 *       <button onClick={nextPage} disabled={!hasNextPage()}>
 *         Next
 *       </button>
 *     </>
 *   );
 * };
 */
