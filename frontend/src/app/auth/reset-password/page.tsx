'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { EnvelopeIcon, DocumentTextIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { authService } from '@/services/auth';

export default function ResetPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm<{ email: string }>();

  const handleReset = async (data: { email: string }) => {
    setIsLoading(true);
    try {
      // Call your password reset API
      // await authService.resetPassword(data.email);
      setSubmittedEmail(data.email);
      setSubmitted(true);
      toast.success('Reset link sent to your email!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
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

        {/* Reset Password Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          {!submitted ? (
            <>
              <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Reset password
              </h2>
              <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-6">
                Enter your email address and we&apos;ll send you a link to reset your password
              </p>

              <form onSubmit={handleSubmit(handleReset)} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      {...register('email', { required: 'Email is required', pattern: /^\S+@\S+$/i })}
                      type="email"
                      placeholder="john@example.com"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  {isLoading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Check your email
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                We&apos;ve sent a password reset link to <strong>{submittedEmail}</strong>
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                Please check your email (and spam folder) for the reset link. The link will expire in 24 hours.
              </p>
            </div>
          )}

          {/* Back to Login Button */}
          <Link
            href="/auth/login"
            className="w-full mt-6 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to login
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-8">
          © 2024 InvoiceGen. All rights reserved.
        </p>
      </div>
    </div>
  );
}
