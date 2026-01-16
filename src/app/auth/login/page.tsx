'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Globe, Headphones, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks';
import { ROUTES } from '@/config';

export default function LoginPage() {
  const router = useRouter();
  const { login, register, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPasswordStep, setShowPasswordStep] = useState(false);
  const [signUpData, setSignUpData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    nationality: 'UAE',
    password_confirmation: '',
  });

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    // Move to password step when email is submitted
    if (email) {
      setShowPasswordStep(true);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (isSignUp) {
      // Handle signup
      if (password !== signUpData.password_confirmation) {
        // Show error for password mismatch
        return;
      }
      const success = await register({
        email,
        password,
        first_name: signUpData.first_name,
        last_name: signUpData.last_name,
        phone: signUpData.phone,
        nationality: signUpData.nationality,
        password_confirmation: signUpData.password_confirmation,
      });
      if (success) {
        router.push(ROUTES.HOME);
      }
    } else {
      // Handle login
      const success = await login({ email, password });
      if (success) {
        router.push(ROUTES.HOME);
      } else if (error && (error.toLowerCase().includes('not found') || error.toLowerCase().includes('invalid'))) {
        // User doesn't exist or invalid credentials, switch to signup
        setIsSignUp(true);
      }
    }
  };

  const handleSocialLogin = (provider: 'facebook' | 'google') => {
    // Implement social login
    console.log(`Login with ${provider}`);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
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
              No Problem for customers
            </h1>
            <p className="text-[15px] leading-[20px] font-normal text-gray-600 mb-8">
              Create an account or log in to book and manage your appointments.
            </p>

            {!showPasswordStep && (
              <>
                {/* Social Login Buttons */}
                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => handleSocialLogin('facebook')}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-gray-300 rounded-full bg-white hover:bg-gray-50 transition-colors text-gray-900 text-[15px] leading-[20px] font-medium"
                  >
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Continue with Facebook
                  </button>

                  <button
                    onClick={() => handleSocialLogin('google')}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-gray-300 rounded-full bg-white hover:bg-gray-50 transition-colors text-gray-900 text-[15px] leading-[20px] font-medium"
                  >
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </button>
                </div>

                {/* OR Separator */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">OR</span>
                  </div>
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearError();
                      }}
                      className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-[15px] leading-[20px]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-4 py-3.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium text-[15px] leading-[20px] focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </form>

                {/* Sign Up Link */}
                <div className="mt-4 text-center">
                  <Link
                    href="/auth/register"
                    className="text-[15px] leading-[20px] text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Don&apos;t have an account? Sign up
                  </Link>
                </div>
              </>
            )}

            {showPasswordStep && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Email input (editable if signup, read-only if login) */}
                <div>
                  {isSignUp ? (
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email.trim()}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearError();
                      }}
                      className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-[15px] leading-[20px]"
                      required
                    />
                  ) : (
                    <>
                      <input
                        type="email"
                        value={email}
                        readOnly
                        className="w-full px-4 py-3.5 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 text-[15px] leading-[20px] cursor-not-allowed"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('');
                          setPassword('');
                          setIsSignUp(false);
                          setShowPasswordStep(false);
                          clearError();
                        }}
                        className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Change email
                      </button>
                    </>
                  )}
                </div>

                {/* Signup fields */}
                {isSignUp && (
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First name"
                      value={signUpData.first_name}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, first_name: e.target.value })
                      }
                      className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-[15px] leading-[20px]"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      value={signUpData.last_name}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, last_name: e.target.value })
                      }
                      className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-[15px] leading-[20px]"
                      required
                    />
                  </div>
                )}

                {isSignUp && (
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={signUpData.phone}
                    onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-[15px] leading-[20px]"
                    required
                  />
                )}

                {/* Password field */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isSignUp ? 'Create a password' : 'Password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearError();
                    }}
                    className="w-full px-4 py-3.5 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-[15px] leading-[20px]"
                    required
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
                </div>

                {/* Confirm password for signup */}
                {isSignUp && (
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm password"
                      value={signUpData.password_confirmation}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, password_confirmation: e.target.value })
                      }
                      className="w-full px-4 py-3.5 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-[15px] leading-[20px]"
                      required
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
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-3.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium text-[15px] leading-[20px] focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? 'Loading...'
                    : isSignUp
                      ? 'Create account'
                      : 'Sign in'}
                </button>

                {!isSignUp && (
                  <div className="text-center">
                    <Link
                      href="/auth/register"
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Don&apos;t have an account? Sign up
                    </Link>
                  </div>
                )}
              </form>
            )}

            {/* Business Account Link */}
            {!showPasswordStep && (
              <div className="mt-6 text-center">
                <p className="text-[15px] leading-[20px] text-gray-600">
                  Have a business account?{' '}
                  <Link
                    href="/auth/vendor/login"
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Sign in as a professional
                  </Link>
                </p>
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
          alt="Happy customer using the app"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
