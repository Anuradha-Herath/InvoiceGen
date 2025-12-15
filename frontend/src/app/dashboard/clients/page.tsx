'use client';

import { ClientListPage } from '@/components/client/ClientListPage';

export default function ClientsPage() {
  // For now, using the default mock clients from ClientListPage
  // When backend is ready, fetch clients from API and pass them here
  return <ClientListPage />;
}
