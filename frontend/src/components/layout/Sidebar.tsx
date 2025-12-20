import React from 'react';
import { LayoutDashboard, FileText, Users, Settings, LogOut, X } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'invoices', label: 'Invoices', icon: FileText, href: '/dashboard/invoices' },
  { id: 'clients', label: 'Clients', icon: Users, href: '/dashboard/clients' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = (href: string) => {
    router.push(href);
    onClose();
  };

  const handleLogout = () => {
    authService.logout();
    router.push('/auth/login');
  };

  const isActive = (href: string) => {
    // For dashboard, only match if it's exactly /dashboard or /dashboard/
    if (href === '/dashboard') {
      return pathname === href || pathname === href + '/';
    }
    // For other routes, check exact match or subroutes
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-50 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-900 font-semibold">InvoiceGen</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavigate(item.href)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                        active
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
