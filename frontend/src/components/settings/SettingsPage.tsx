import React, { useState, useEffect } from 'react';
import { User, Building2, Mail, CreditCard, Upload } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Tabs } from '../ui/Tabs';
import { apiClient } from '@/services/api';
import toast from 'react-hot-toast';

export function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [company, setCompany] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    taxId: '',
    logoUrl: '',
  });

  const [emailSettings, setEmailSettings] = useState({
    subject: '',
    message: '',
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // Load profile
      const profileResponse = await apiClient.get('/settings/profile');
      if (profileResponse.data) {
        setProfile((prev) => ({
          ...prev,
          name: profileResponse.data.name || '',
          email: profileResponse.data.email || '',
        }));
      }

      // Load company settings
      const companyResponse = await apiClient.get('/settings/company');
      if (companyResponse.data) {
        const companyData = companyResponse.data;
        setCompany({
          name: companyData.name || '',
          address: companyData.address || '',
          phone: companyData.phone || '',
          email: companyData.email || '',
          website: companyData.website || '',
          taxId: companyData.taxId || '',
          logoUrl: companyData.logoUrl || '',
        });
        if (companyData.logoUrl) {
          setLogoPreview(companyData.logoUrl);
        }
      }

      // Load email template
      const emailResponse = await apiClient.get('/settings/email-template');
      if (emailResponse.data) {
        setEmailSettings({
          subject: emailResponse.data.subject || '',
          message: emailResponse.data.message || '',
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Set default values on error
      setProfile((prev) => ({
        ...prev,
        name: 'User',
        email: '',
      }));
      setEmailSettings({
        subject: 'Invoice from {{company_name}}',
        message: `Hi {{client_name}},\n\nPlease find attached invoice {{invoice_number}} for {{invoice_amount}}.\n\nPayment is due by {{due_date}}.\n\nThank you for your business!\n\nBest regards,\n{{company_name}}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = () => {
    if (!profile.name || !profile.email) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    apiClient
      .put('/settings/profile', {
        name: profile.name,
        email: profile.email,
      })
      .then(() => {
        toast.success('Profile updated successfully');
      })
      .catch((error) => {
        const message = error.response?.data?.message || 'Failed to update profile';
        toast.error(message);
      })
      .finally(() => {
        setIsLoading(false);
      });
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

    setIsLoading(true);
    apiClient
      .post('/settings/change-password', {
        currentPassword: profile.currentPassword,
        newPassword: profile.newPassword,
      })
      .then(() => {
        toast.success('Password updated successfully');
        setProfile({
          ...profile,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      })
      .catch((error) => {
        const message = error.response?.data?.message || 'Failed to update password';
        toast.error(message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSaveCompany = () => {
    if (!company.name || !company.email) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsLoading(true);
    apiClient
      .put('/settings/company', {
        name: company.name,
        address: company.address,
        phone: company.phone,
        email: company.email,
        website: company.website,
        taxId: company.taxId,
      })
      .then(() => {
        toast.success('Company information updated successfully');
      })
      .catch((error) => {
        const message = error.response?.data?.message || 'Failed to update company info';
        toast.error(message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleUploadLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PNG, JPG, GIF, or SVG image');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setLogoFile(file);
    
    // Read file as base64 and upload
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      setLogoPreview(base64Data);
      
      // Extract base64 string (remove data:image/...;base64, prefix)
      const base64String = base64Data.split(',')[1];
      
      setIsLoading(true);
      apiClient
        .post('/settings/upload-logo', {
          imageData: base64String,
          fileName: file.name,
          mimeType: file.type,
        })
        .then((response) => {
          console.log('Upload response:', response);
          console.log('Logo URL from response:', response.data?.logoUrl);
          
          const logoUrl = response.data?.logoUrl;
          if (!logoUrl) {
            toast.error('Logo uploaded but URL not received from server');
            console.error('Missing logoUrl in response:', response.data);
            return;
          }
          
          toast.success('Logo uploaded successfully');
          setCompany((prev) => ({
            ...prev,
            logoUrl: logoUrl,
          }));
          // Update preview to show the S3 URL for persistence
          setLogoPreview(logoUrl);
          console.log('Logo preview updated to:', logoUrl);
        })
        .catch((error) => {
          console.error('Upload error:', error);
          const message = error.response?.data?.error || error.response?.data?.message || 'Failed to upload logo';
          toast.error(message);
        })
        .finally(() => {
          setIsLoading(false);
        });
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEmailTemplate = () => {
    if (!emailSettings.subject || !emailSettings.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    apiClient
      .put('/settings/email-template', {
        subject: emailSettings.subject,
        message: emailSettings.message,
      })
      .then(() => {
        toast.success('Email template saved successfully');
      })
      .catch((error) => {
        const message = error.response?.data?.message || 'Failed to save email template';
        toast.error(message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleChangePlan = () => {
    toast.success('Plan change feature coming soon');
  };

  const handleUpdatePayment = () => {
    toast.success('Payment method update feature coming soon');
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
              <CardTitle>Current Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Business Name:</span>
                  <span className="text-gray-900 font-medium">{company.name || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Email:</span>
                  <span className="text-gray-900 font-medium">{company.email || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Phone:</span>
                  <span className="text-gray-900 font-medium">{company.phone || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Address:</span>
                  <span className="text-gray-900 font-medium">{company.address || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Website:</span>
                  <span className="text-gray-900 font-medium">{company.website || '-'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Tax ID:</span>
                  <span className="text-gray-900 font-medium">{company.taxId || '-'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Edit Company Information</CardTitle>
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
                  <div className="w-24 h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <label>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        disabled={isLoading}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById('logo-upload')?.click();
                        }}
                      >
                        <Upload className="w-4 h-4" />
                        Upload Logo
                      </Button>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/png,image/jpeg,image/gif,image/svg+xml"
                        onChange={handleUploadLogo}
                        className="hidden"
                        disabled={isLoading}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      PNG, JPG, GIF, or SVG. Max 5MB
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
