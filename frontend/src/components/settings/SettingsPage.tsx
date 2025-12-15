import React, { useState } from 'react';
import { User, Building2, Mail, CreditCard, Upload } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Tabs } from '../ui/Tabs';
import toast from 'react-hot-toast';

export function SettingsPage() {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [company, setCompany] = useState({
    name: 'InvoiceGen Inc',
    address: '456 Business Rd, San Francisco, CA 94102',
    phone: '+1 (555) 123-4567',
    email: 'contact@invoicegen.com',
    website: 'www.invoicegen.com',
    taxId: '12-3456789',
  });

  const [emailSettings, setEmailSettings] = useState({
    subject: 'Invoice from {{company_name}}',
    message: `Hi {{client_name}},

Please find attached invoice {{invoice_number}} for {{invoice_amount}}.

Payment is due by {{due_date}}.

Thank you for your business!

Best regards,
{{company_name}}`,
  });

  const handleSaveProfile = () => {
    if (!profile.name || !profile.email) {
      toast.error('Please fill in all fields');
      return;
    }
    toast.success('Profile updated successfully');
  };

  const handleUpdatePassword = () => {
    if (!profile.currentPassword || !profile.newPassword || !profile.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (profile.newPassword !== profile.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (profile.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    toast.success('Password updated successfully');
    setProfile({
      ...profile,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleSaveCompany = () => {
    if (!company.name || !company.email) {
      toast.error('Please fill in required fields');
      return;
    }
    toast.success('Company information updated successfully');
  };

  const handleUploadLogo = () => {
    toast.success('Logo upload feature coming soon');
  };

  const handleSaveEmailTemplate = () => {
    if (!emailSettings.subject || !emailSettings.message) {
      toast.error('Please fill in all fields');
      return;
    }
    toast.success('Email template saved successfully');
  };

  const handleChangePlan = () => {
    toast.info('Plan change feature coming soon');
  };

  const handleUpdatePayment = () => {
    toast.info('Payment method update feature coming soon');
  };

  const tabs = [
    {
      label: 'Profile',
      value: 'profile',
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  icon={<User className="w-4 h-4" />}
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  icon={<Mail className="w-4 h-4" />}
                />
                <div className="pt-4">
                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  value={profile.currentPassword}
                  onChange={(e) =>
                    setProfile({ ...profile, currentPassword: e.target.value })
                  }
                />
                <Input
                  label="New Password"
                  type="password"
                  value={profile.newPassword}
                  onChange={(e) =>
                    setProfile({ ...profile, newPassword: e.target.value })
                  }
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={profile.confirmPassword}
                  onChange={(e) =>
                    setProfile({ ...profile, confirmPassword: e.target.value })
                  }
                />
                <div className="pt-4">
                  <Button onClick={handleUpdatePassword}>Update Password</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      label: 'Company',
      value: 'company',
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  label="Business Name"
                  value={company.name}
                  onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  icon={<Building2 className="w-4 h-4" />}
                />
                <Input
                  label="Address"
                  value={company.address}
                  onChange={(e) => setCompany({ ...company, address: e.target.value })}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Phone"
                    value={company.phone}
                    onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={company.email}
                    onChange={(e) => setCompany({ ...company, email: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Website"
                    value={company.website}
                    onChange={(e) => setCompany({ ...company, website: e.target.value })}
                  />
                  <Input
                    label="Tax ID"
                    value={company.taxId}
                    onChange={(e) => setCompany({ ...company, taxId: e.target.value })}
                  />
                </div>
                <div className="pt-4">
                  <Button onClick={handleSaveCompany}>Save Changes</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Company Logo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <Button variant="secondary" size="sm" onClick={handleUploadLogo}>
                      <Upload className="w-4 h-4" />
                      Upload Logo
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      Recommended: 200x200px, PNG or JPG
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      label: 'Email',
      value: 'email',
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Email Template</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="Email Subject"
                value={emailSettings.subject}
                onChange={(e) =>
                  setEmailSettings({ ...emailSettings, subject: e.target.value })
                }
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Message
                </label>
                <textarea
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  rows={12}
                  value={emailSettings.message}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, message: e.target.value })
                  }
                />
                <p className="text-xs text-gray-500 mt-2">
                  Available variables: {'{'}{'{'} company_name {'}'} {'}'}, {'{'}{'{'} client_name {'}'} {'}'}, {'{'}{'{'} invoice_number {'}'} {'}'}, {'{'}{'{'} invoice_amount {'}'} {'}'}, {'{'}{'{'} due_date {'}'} {'}'}
                </p>
              </div>
              <div className="pt-4">
                <Button onClick={handleSaveEmailTemplate}>Save Template</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      label: 'Billing',
      value: 'billing',
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-gray-900 font-medium">Professional Plan</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Unlimited invoices, clients, and features
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">$29</p>
                  <p className="text-sm text-gray-600">/month</p>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="ghost" onClick={handleChangePlan}>
                  Change Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-gray-600">Expires 12/2026</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleUpdatePayment}>
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultValue="profile" />
    </div>
  );
}
