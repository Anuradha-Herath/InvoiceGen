import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { Modal } from '../ui/Modal';
import { apiClient } from '@/services/api';
import toast from 'react-hot-toast';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  address?: string;
  invoices?: number;
}

interface ClientListPageProps {
  onClientAdded?: (client: Client) => void;
}

const mockClients: Client[] = [];
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corp',
    address: '123 Business Ave, Suite 100, New York, NY 10001',
    invoices: 12,
  },
  {
    id: '2',
    name: 'John Smith',
    email: 'john@techstart.com',
    phone: '+1 (555) 234-5678',
    company: 'TechStart Inc',
    address: '456 Innovation Blvd, San Francisco, CA 94105',
    invoices: 8,
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    email: 'sarah@global.com',
    phone: '+1 (555) 345-6789',
    company: 'Global Solutions',
    address: '789 Enterprise Dr, Austin, TX 78701',
    invoices: 15,
  },
  {
    id: '4',
    name: 'Mike Williams',
    email: 'mike@creative.com',
    phone: '+1 (555) 456-7890',
    company: 'Creative Agency',
    address: '321 Design St, Los Angeles, CA 90001',
    invoices: 6,
  },
];

export function ClientListPage({ onClientAdded }: ClientListPageProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
  });

  // Load clients on mount
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/clients');
      const clientList = response.data.data || [];
      setClients(clientList);
    } catch (error) {
      console.error('Failed to load clients:', error);
      toast.error('Failed to load clients');
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone || '',
        company: client.company,
        address: client.address || '',
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
    });
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingClient(null);
  };

  const handleSaveClient = () => {
    if (!formData.name || !formData.email || !formData.company) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    const saveOperation = editingClient
      ? apiClient.put(`/clients/${editingClient.id}`, formData)
      : apiClient.post('/clients', formData);

    saveOperation
      .then((response) => {
        if (editingClient) {
          toast.success(`${formData.name} updated successfully`);
        } else {
          toast.success(`${formData.name} added successfully`);
          if (onClientAdded) {
            onClientAdded(response.data.data);
          }
        }
        loadClients();
        handleCloseModal();
      })
      .catch((error) => {
        const message = error.response?.data?.message || 'Failed to save client';
        toast.error(message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleDeleteClient = (client: Client) => {
    if (confirm(`Are you sure you want to delete ${client.name}?`)) {
      setIsLoading(true);
      apiClient
        .delete(`/clients/${client.id}`)
        .then(() => {
          toast.success(`${client.name} deleted successfully`);
          loadClients();
        })
        .catch((error) => {
          const message = error.response?.data?.message || 'Failed to delete client';
          toast.error(message);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const handleViewClient = (client: Client) => {
    setViewingClient(client);
    setIsViewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">Manage your client information</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4" />
          Add Client
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <Input
            placeholder="Search by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading clients...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No clients found</p>
              {clients.length === 0 ? (
                <Button onClick={() => handleOpenModal()}>Add your first client</Button>
              ) : (
                <p className="text-sm text-gray-400">Try adjusting your search</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead># of Invoices</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell className="text-gray-600">{client.email}</TableCell>
                      <TableCell>{client.company}</TableCell>
                      <TableCell>
                        <span className="text-blue-600 font-medium">{client.invoices || 0}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewClient(client)}
                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-all"
                            title="View"
                            disabled={isLoading}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenModal(client)}
                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-all"
                            title="Edit"
                            disabled={isLoading}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client)}
                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded transition-all"
                            title="Delete"
                            disabled={isLoading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingClient ? `Edit ${editingClient.name}` : 'Add Client'}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleSaveClient}>
              {editingClient ? 'Update Client' : 'Save Client'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Email *"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Phone"
            placeholder="+1 (555) 000-0000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Company *"
            placeholder="Acme Corporation"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
          <Input
            label="Address"
            placeholder="123 Main St, City, State, ZIP"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>
      </Modal>

      {/* View Client Detail Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        title={viewingClient ? `${viewingClient.name}` : 'Client Details'}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={handleCloseViewModal}>
              Close
            </Button>
            <Button onClick={() => {
              setFormData({
                name: viewingClient?.name || '',
                email: viewingClient?.email || '',
                phone: viewingClient?.phone || '',
                company: viewingClient?.company || '',
                address: viewingClient?.address || '',
              });
              setEditingClient(viewingClient || null);
              setIsViewModalOpen(false);
              setIsModalOpen(true);
            }}>
              Edit Client
            </Button>
          </div>
        }
      >
        {viewingClient && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-gray-900">{viewingClient.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{viewingClient.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <p className="mt-1 text-gray-900">{viewingClient.phone || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Company</label>
              <p className="mt-1 text-gray-900">{viewingClient.company}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <p className="mt-1 text-gray-900">{viewingClient.address || 'N/A'}</p>
            </div>
            <div className="pt-4 border-t">
              <label className="block text-sm font-medium text-gray-700">Total Invoices</label>
              <p className="mt-1 text-blue-600 font-semibold">{viewingClient.invoices} invoices</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
