'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Globe, Headphones, Mail, CheckCircle2 } from 'lucide-react';
import { forgotPassword } from '@/lib/auth';
import { ROUTES } from '@/config';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    if (!email) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      await forgotPassword({ email });
      setIsEmailSent(true);
      setEmail('');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.email?.[0] ||
        'Something went wrong. Please try again.';
      setEmailError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div className="p-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 max-w-2xl mx-auto w-full">
          <div className="w-full max-w-md">
            <h1 className="text-[24px] leading-[32px] font-semibold text-gray-900 mb-2">
              {isEmailSent ? 'Check your email' : 'Forgot your password?'}
            </h1>
            <p className="text-[15px] leading-[20px] font-normal text-gray-600 mb-8">
              {isEmailSent
                ? "We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password."
                : "No worries! Enter your email address and we'll send you a link to reset your password."}
            </p>

            {!isEmailSent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {emailError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-600">{emailError}</p>
                  </div>
                )}

                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                    }}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-[15px] leading-[20px]"
                    required
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-3.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium text-[15px] leading-[20px] focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-center p-6 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setIsEmailSent(false);
                      setEmail('');
                    }}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium text-[15px] leading-[20px] text-gray-900"
                  >
                    Send another email
                  </button>

                  <Link
                    href={ROUTES.LOGIN}
                    className="block w-full px-4 py-3.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium text-[15px] leading-[20px] text-center"
                  >
                    Back to login
                  </Link>
                </div>
              </div>
            )}

            {/* Back to Login Link */}
            {!isEmailSent && (
              <div className="mt-6 text-center">
                <Link
                  href={ROUTES.LOGIN}
                  className="text-[15px] leading-[20px] text-purple-600 hover:text-purple-700 font-medium"
                >
                  Remember your password? Sign in
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Language and Help */}
        <div className="p-6 flex items-center justify-between text-sm text-gray-600 border-t border-gray-200">
          <button className="flex items-center gap-2 hover:text-gray-900 transition-colors text-sm">
            <Globe className="h-4 w-4" />
            <span>English</span>
          </button>
          <button className="flex items-center gap-2 hover:text-gray-900 transition-colors text-sm">
            <Headphones className="h-4 w-4" />
            <span>Help and support</span>
          </button>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/login.webp"
          alt="Password reset"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
