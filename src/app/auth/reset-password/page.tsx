'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Globe, Headphones, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { resetPassword } from '@/lib/auth';
import { ROUTES } from '@/config';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    password_confirmation?: string;
    token?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Get token and email from URL query parameters
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');

    if (tokenParam) {
      setToken(tokenParam);
    }
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const validatePassword = (password: string) => {
    // Minimum 8 characters
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const passwordError = validatePassword(password);
    if (passwordError) {
      setErrors({ password: passwordError });
      return;
    }

    if (password !== passwordConfirmation) {
      setErrors({ password_confirmation: 'Passwords do not match' });
      return;
    }

    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!token) {
      setErrors({ token: 'Reset token is required' });
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      setIsSuccess(true);
    } catch (error: any) {
      const errorData = error.response?.data;
      const newErrors: typeof errors = {};

      if (errorData?.errors) {
        Object.keys(errorData.errors).forEach((key) => {
          newErrors[key as keyof typeof newErrors] = errorData.errors[key][0];
        });
      } else {
        newErrors.general =
          errorData?.message || 'Something went wrong. Please try again.';
      }

      setErrors(newErrors);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex">
        <div className="flex-1 flex flex-col bg-white">
          <div className="p-6">
            <button
              onClick={() => router.push(ROUTES.LOGIN)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 max-w-2xl mx-auto w-full">
            <div className="w-full max-w-md">
              <div className="flex items-center justify-center p-6 bg-green-50 border border-green-200 rounded-xl mb-6">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>

              <h1 className="text-[24px] leading-[32px] font-semibold text-gray-900 mb-2 text-center">
                Password reset successful!
              </h1>
              <p className="text-[15px] leading-[20px] font-normal text-gray-600 mb-8 text-center">
                Your password has been reset successfully. You can now login with your new password.
              </p>

              <Link
                href={ROUTES.LOGIN}
                className="block w-full px-4 py-3.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium text-[15px] leading-[20px] text-center"
              >
                Go to login
              </Link>
            </div>
          </div>

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

        <div className="hidden lg:block lg:w-1/2 relative">
          <Image
            src="/login.webp"
            alt="Password reset successful"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    );
  }

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
              Reset your password
            </h1>
            <p className="text-[15px] leading-[20px] font-normal text-gray-600 mb-8">
              Enter your new password below. Make sure it's at least 8 characters long.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: undefined });
                  }}
                  className={`w-full px-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-[15px] leading-[20px] ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                  disabled={isLoading || !!searchParams.get('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {!searchParams.get('token') && (
                <div>
                  <input
                    type="text"
                    placeholder="Reset token"
                    value={token}
                    onChange={(e) => {
                      setToken(e.target.value);
                      setErrors({ ...errors, token: undefined });
                    }}
                    className={`w-full px-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-[15px] leading-[20px] ${
                      errors.token ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                    disabled={isLoading}
                  />
                  {errors.token && (
                    <p className="mt-1 text-sm text-red-600">{errors.token}</p>
                  )}
                </div>
              )}

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({ ...errors, password: undefined });
                  }}
                  className={`w-full px-4 py-3.5 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-[15px] leading-[20px] ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div className="relative">
                <input
                  type={showPasswordConfirmation ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={passwordConfirmation}
                  onChange={(e) => {
                    setPasswordConfirmation(e.target.value);
                    setErrors({ ...errors, password_confirmation: undefined });
                  }}
                  className={`w-full px-4 py-3.5 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-[15px] leading-[20px] ${
                    errors.password_confirmation ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswordConfirmation(!showPasswordConfirmation)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswordConfirmation ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
                {errors.password_confirmation && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password_confirmation}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium text-[15px] leading-[20px] focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Resetting password...' : 'Reset password'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href={ROUTES.LOGIN}
                className="text-[15px] leading-[20px] text-purple-600 hover:text-purple-700 font-medium"
              >
                Back to login
              </Link>
            </div>
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
          alt="Reset password"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
