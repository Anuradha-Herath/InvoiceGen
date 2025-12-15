import { create } from 'zustand';
import { Invoice } from '@/types/invoice';

interface InvoiceStore {
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  isLoading: boolean;
  error: string | null;
  setInvoices: (invoices: Invoice[]) => void;
  setCurrentInvoice: (invoice: Invoice | null) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, invoice: Invoice) => void;
  removeInvoice: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useInvoiceStore = create<InvoiceStore>((set) => ({
  invoices: [],
  currentInvoice: null,
  isLoading: false,
  error: null,
  setInvoices: (invoices) => set({ invoices }),
  setCurrentInvoice: (invoice) => set({ currentInvoice: invoice }),
  addInvoice: (invoice) =>
    set((state) => ({ invoices: [invoice, ...state.invoices] })),
  updateInvoice: (id, invoice) =>
    set((state) => ({
      invoices: state.invoices.map((inv) => (inv.id === id ? invoice : inv)),
      currentInvoice: state.currentInvoice?.id === id ? invoice : state.currentInvoice,
    })),
  removeInvoice: (id) =>
    set((state) => ({
      invoices: state.invoices.filter((inv) => inv.id !== id),
      currentInvoice: state.currentInvoice?.id === id ? null : state.currentInvoice,
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
