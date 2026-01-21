'use client';

import { useState } from 'react';
import { X, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'email' | 'password' | 'signup';

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const { login, register, isLoading, error, clearError } = useAuth();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Signup fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setStep('email');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setPasswordError(null);
    setFirstName('');
    setLastName('');
    setPhone('');
    setPasswordConfirmation('');
    clearError();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleBack = () => {
    if (step === 'password' || step === 'signup') {
      setStep('email');
      setPassword('');
      setPasswordError(null);
      clearError();
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (email.trim()) {
      setStep('password');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setPasswordError(null);

    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    const success = await login({ email: email.trim(), password }, true);
    if (success) {
      resetForm();
      onSuccess();
    } else if (error && (error.toLowerCase().includes('not found') || error.toLowerCase().includes('invalid'))) {
      // User doesn't exist or wrong password, switch to signup
      setStep('signup');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setPasswordError(null);

    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    if (password !== passwordConfirmation) {
      setPasswordError('Passwords do not match');
      return;
    }

    const success = await register({
      email: email.trim(),
      password,
      password_confirmation: passwordConfirmation,
      first_name: firstName,
      last_name: lastName,
      phone: phone || '',
    }, true);

    if (success) {
      resetForm();
      onSuccess();
    }
  };

  const handleSocialLogin = (provider: 'facebook' | 'google') => {
    // TODO: Implement social login
    console.log(`Login with ${provider}`);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-120 relative">
          {/* Header with Back and Close buttons */}
          <div className="flex items-center justify-between pl-4 pr-10 py-4">
            {step !== 'email' ? (
              <button
                onClick={handleBack}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </button>
            ) : (
              <div className="h-8 w-8" />
            )}
            <button
              onClick={handleClose}
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="px-11 pb-11">
            {/* Step 1: Email Entry */}
            {step === 'email' && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Log in or sign up
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Log in or sign up to complete your booking
                </p>

                {/* Social Login Buttons */}
                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => handleSocialLogin('facebook')}
                    className="w-full relative flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5 absolute left-4" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span className="font-medium text-gray-900">Continue with Facebook</span>
                  </button>

                  <button
                    onClick={() => handleSocialLogin('google')}
                    className="w-full relative flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5 absolute left-4" viewBox="0 0 24 24">
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
                    <span className="font-medium text-gray-900">Continue with Google</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">OR</span>
                  </div>
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    required
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 placeholder-gray-400"
                  />

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Continue
                  </button>
                </form>
              </>
            )}

            {/* Step 2: Password Entry (Login) */}
            {step === 'password' && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome back
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Enter your password to log in as<br />
                  <span className="font-medium text-gray-900">{email}</span>
                </p>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setPasswordError(null);
                        }}
                        className={`w-full px-4 py-3.5 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 ${
                          passwordError || error ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="text-sm text-red-500 mt-2">{passwordError}</p>
                    )}
                    {error && !passwordError && (
                      <p className="text-sm text-red-500 mt-2">{error}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Forgot password?
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Loading...' : 'Continue'}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setStep('signup')}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Don&apos;t have an account? <span className="font-medium text-blue-600">Sign up</span>
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Sign Up */}
            {step === 'signup' && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Create account
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Sign up to complete your booking
                </p>

                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      required
                      className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 placeholder-gray-400"
                    />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      required
                      className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    required
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 placeholder-gray-400"
                  />

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number (optional)"
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 placeholder-gray-400"
                  />

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError(null);
                      }}
                      placeholder="Create password"
                      required
                      className={`w-full px-4 py-3.5 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 placeholder-gray-400 ${
                        passwordError ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="Confirm password"
                    required
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 placeholder-gray-400"
                  />

                  {passwordError && (
                    <p className="text-sm text-red-500">{passwordError}</p>
                  )}
                  {error && !passwordError && (
                    <p className="text-sm text-red-500">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creating account...' : 'Create account'}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setStep('password')}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Already have an account? <span className="font-medium text-blue-600">Log in</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
