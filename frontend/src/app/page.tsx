'use client';

import Link from 'next/link';
import {
  DocumentTextIcon,
  UsersIcon,
  EnvelopeIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  SparklesIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const features = [
    {
      icon: DocumentTextIcon,
      title: 'Professional Invoices',
      description: 'Create beautiful, branded invoices in seconds with our intuitive invoice builder and customizable templates.'
    },
    {
      icon: UsersIcon,
      title: 'Client Management',
      description: 'Organize and manage all your clients in one place with detailed contact information and invoice history.'
    },
    {
      icon: ArrowDownTrayIcon,
      title: 'PDF Export',
      description: 'Generate professional PDF invoices instantly with one click, ready to send to your clients.'
    },
    {
      icon: EnvelopeIcon,
      title: 'Email Integration',
      description: 'Send invoices directly to clients via email with customizable templates and automatic delivery.'
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics Dashboard',
      description: 'Track your revenue, outstanding payments, and business metrics with real-time analytics.'
    },
    {
      icon: ClockIcon,
      title: 'Auto-calculations',
      description: 'Automatic tax, discount, and total calculations ensure accuracy in every invoice you create.'
    }
  ];

  const benefits = [
    'Unlimited invoices and clients',
    'Professional PDF generation',
    'Email invoice delivery',
    'Real-time analytics',
    'Dark mode support',
    'Mobile responsive design',
    'Secure data storage',
    'Regular updates'
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold dark:text-white">InvoiceFlow</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-full mb-6">
              <SparklesIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-600 dark:text-blue-400">
                Professional invoicing made simple
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl mb-6 font-bold bg-gradient-to-r from-blue-900 to-blue-600 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
              Create Professional Invoices in Minutes
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
              The complete invoice management solution for freelancers and small businesses.
              Create, send, and track invoices with ease.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/auth/signup"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
              >
                Start Free Trial
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors font-semibold"
              >
                View Demo
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-12 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 dark:text-white">Everything You Need to Manage Invoices</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Powerful features designed to simplify your invoicing workflow and help you get paid faster.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-lg"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold mb-3 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 dark:text-white">
                Why Choose InvoiceFlow?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Join thousands of freelancers and small businesses who trust InvoiceFlow
                to manage their invoicing needs.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/auth/signup"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold inline-flex items-center gap-2"
              >
                Get Started Now
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-blue-900 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <DocumentTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-gray-800 dark:text-gray-200">Invoice #1234</span>
                    </div>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm">Paid</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                      <span className="text-gray-800 dark:text-gray-200">$2,450.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Tax (10%)</span>
                      <span className="text-gray-800 dark:text-gray-200">$245.00</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">Total</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">$2,695.00</span>
                    </div>
                  </div>

                  <div className="pt-4 grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                      <div className="text-2xl font-semibold text-gray-800 dark:text-gray-200">24</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Invoices</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                      <div className="text-2xl font-semibold text-gray-800 dark:text-gray-200">12</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Clients</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl mb-2 font-bold bg-gradient-to-r from-blue-900 to-blue-600 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
                10K+
              </div>
              <div className="text-gray-600 dark:text-gray-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl mb-2 font-bold bg-gradient-to-r from-blue-900 to-blue-600 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
                500K+
              </div>
              <div className="text-gray-600 dark:text-gray-400">Invoices Created</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl mb-2 font-bold bg-gradient-to-r from-blue-900 to-blue-600 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
                $50M+
              </div>
              <div className="text-gray-600 dark:text-gray-400">Processed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl mb-2 font-bold bg-gradient-to-r from-blue-900 to-blue-600 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
                4.9★
              </div>
              <div className="text-gray-600 dark:text-gray-400">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-blue-600 to-blue-900 rounded-2xl p-12 shadow-2xl">
            <h2 className="text-3xl sm:text-4xl text-white mb-4 font-bold">
              Ready to Streamline Your Invoicing?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who trust InvoiceFlow to manage their invoices.
              Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold inline-flex items-center gap-2 justify-center"
              >
                Start Free Trial
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-3 text-white border-2 border-white rounded-lg hover:bg-white/10 transition-all duration-200 font-semibold"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4 dark:text-white">Product</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</button></li>
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Pricing</button></li>
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Security</button></li>
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Updates</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 dark:text-white">Company</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</button></li>
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</button></li>
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Careers</button></li>
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 dark:text-white">Resources</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Documentation</button></li>
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Help Center</button></li>
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Templates</button></li>
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">API</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 dark:text-white">Legal</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy</button></li>
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms</button></li>
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Cookies</button></li>
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Licenses</button></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-4 h-4 text-white" />
              </div>
              <span>© 2024 InvoiceFlow. All rights reserved.</span>
            </div>

            <div className="flex items-center gap-6">
              <GlobeAltIcon className="w-5 h-5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors" />
              <ShieldCheckIcon className="w-5 h-5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors" />
              <CreditCardIcon className="w-5 h-5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
