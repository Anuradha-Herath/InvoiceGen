'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { EnvelopeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { apiClient } from '@/services/api';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    } else {
      // If no email in params, redirect back to signup
      router.push('/auth/signup');
    }
  }, [searchParams, router]);

  // Timer for resend button
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || code.trim().length === 0) {
      toast.error('Please enter the verification code');
      return;
    }

    if (code.length < 6) {
      toast.error('Verification code must be 6 digits');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/confirm-signup', {
        email,
        code: code.trim(),
      });

      toast.success('Email verified successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Verification failed';
      toast.error(message);
      setCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error('Email not found');
      return;
    }

    setIsResending(true);
    try {
      await apiClient.post('/auth/resend-confirmation', {
        email,
      });

      toast.success('Verification code sent to your email');
      setResendTimer(60); // 60 seconds before can resend again
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to resend code';
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <DocumentTextIcon className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-semibold text-gray-900 dark:text-white">InvoiceGen</span>
          </div>
        </div>

        {/* Verify Email Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Verify your email
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-6">
            We've sent a verification code to <span className="font-semibold text-gray-900 dark:text-white">{email}</span>
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            {/* Code Input Field */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Verification Code
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  id="code"
                  placeholder="000000"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2 text-center text-lg font-semibold tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Enter the 6-digit code from your email
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || code.length < 6}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-gray-800 mt-6"
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          {/* Resend Code Section */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendCode}
              disabled={isResending || resendTimer > 0}
              className="w-full py-2.5 px-4 border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? 'Sending...' : resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
            </button>
          </div>

          {/* Back to Signup */}
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Change email?{' '}
            <Link
              href="/auth/signup"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
            >
              Create new account
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-8">
          © 2024 InvoiceGen. All rights reserved.
        </p>
      </div>
    </div>
  );
}
