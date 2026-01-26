'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Globe, Headphones, User, Mail, Lock, Phone, Shield, MapPin, Calendar, CreditCard, CheckCircle2, X, Eye, EyeOff, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/hooks';
import api from '@/lib/api';
import { ROUTES, STORAGE_KEYS } from '@/config';

// Nationality options
const NATIONALITIES = [
  'Afghan', 'Albanian', 'Algerian', 'American', 'Argentine', 'Australian', 'Austrian',
  'Bahraini', 'Bangladeshi', 'Belgian', 'Brazilian', 'British', 'Bulgarian',
  'Canadian', 'Chinese', 'Colombian', 'Croatian', 'Czech',
  'Danish', 'Dutch',
  'Egyptian', 'Emirati', 'Ethiopian',
  'Filipino', 'Finnish', 'French',
  'German', 'Greek',
  'Hungarian',
  'Indian', 'Indonesian', 'Iranian', 'Iraqi', 'Irish', 'Italian',
  'Japanese', 'Jordanian',
  'Kenyan', 'Korean', 'Kuwaiti',
  'Lebanese',
  'Malaysian', 'Mexican', 'Moroccan',
  'Nepalese', 'New Zealander', 'Nigerian', 'Norwegian',
  'Omani',
  'Pakistani', 'Palestinian', 'Peruvian', 'Polish', 'Portuguese',
  'Qatari',
  'Romanian', 'Russian',
  'Saudi', 'Serbian', 'Singaporean', 'South African', 'Spanish', 'Sri Lankan', 'Sudanese', 'Swedish', 'Swiss', 'Syrian',
  'Thai', 'Tunisian', 'Turkish',
  'Ukrainian',
  'Vietnamese',
  'Yemeni',
  'Other',
];

// Emirates options
const EMIRATES = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah',
];

// Step definitions
const STEPS = [
  { id: 0, name: 'Account', icon: User },
  { id: 1, name: 'Emirates ID', icon: Shield },
  { id: 2, name: 'Location', icon: MapPin },
  { id: 3, name: 'Verify Phone', icon: Phone },
  { id: 4, name: 'Payment', icon: CreditCard },
];

interface ServiceArea {
  id: string;
  name: string;
}

interface FormData {
  // Step 0 - Account
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  // Step 1 - Emirates ID
  emirates_id: string;
  emirates_id_front: File | null;
  emirates_id_back: File | null;
  // Step 2 - Location
  address_label: string;
  street_address: string;
  building: string;
  apartment: string;
  city: string;
  emirate: string;
  service_area_id: string;
  latitude: number | null;
  longitude: number | null;
  // Step 3 - Phone Verification (optional for now)
  firebase_id_token: string | null;
  // Step 4 - Payment (optional)
  skip_payment: boolean;
  card_number: string;
  card_expiry: string;
  card_cvv: string;
  card_name: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { clearError } = useAuth();
  
  // Get return URL from query params
  const [returnUrl, setReturnUrl] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const url = params.get('returnUrl');
      if (url) {
        setReturnUrl(decodeURIComponent(url));
      }
    }
  }, []);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [serviceAreasLoading, setServiceAreasLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const emiratesIdFrontRef = useRef<HTMLInputElement>(null);
  const emiratesIdBackRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    nationality: 'UAE',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    emirates_id: '',
    emirates_id_front: null,
    emirates_id_back: null,
    address_label: 'Home',
    street_address: '',
    building: '',
    apartment: '',
    city: '',
    emirate: '',
    service_area_id: '',
    latitude: null,
    longitude: null,
    firebase_id_token: null,
    skip_payment: true,
    card_number: '',
    card_expiry: '',
    card_cvv: '',
    card_name: '',
  });

  // Fetch service areas
  useEffect(() => {
    const fetchServiceAreas = async () => {
      setServiceAreasLoading(true);
      try {
        const response = await api.get('/public/service-areas');
        setServiceAreas(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch service areas', error);
      } finally {
        setServiceAreasLoading(false);
      }
    };
    fetchServiceAreas();
  }, []);

  // Update form data
  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    clearError();
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.first_name.trim()) errors.first_name = 'First name is required';
      if (!formData.last_name.trim()) errors.last_name = 'Last name is required';
      if (!formData.nationality) errors.nationality = 'Nationality is required';
      if (!formData.email.trim()) errors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format';
      if (!formData.phone.trim()) errors.phone = 'Phone number is required';
      if (!formData.password) errors.password = 'Password is required';
      else if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
      if (formData.password !== formData.password_confirmation) {
        errors.password_confirmation = 'Passwords do not match';
      }
    } else if (step === 1) {
      if (!formData.emirates_id.trim()) errors.emirates_id = 'Emirates ID number is required';
      if (!formData.emirates_id_front) errors.emirates_id_front = 'Front side image is required';
      if (!formData.emirates_id_back) errors.emirates_id_back = 'Back side image is required';
    } else if (step === 2) {
      if (!formData.street_address.trim()) errors.street_address = 'Street address is required';
      if (!formData.city.trim()) errors.city = 'City is required';
      if (!formData.emirate) errors.emirate = 'Emirate is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'emirates_id_front' | 'emirates_id_back') => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormData(field, file);
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    clearError();
    setGeneralError(null);
    setIsSubmitting(true);
    
    try {
      // Prepare form data for API
      const submitData = new FormData();
      
      // Account info
      submitData.append('first_name', formData.first_name);
      submitData.append('last_name', formData.last_name);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('password', formData.password);
      submitData.append('password_confirmation', formData.password_confirmation);
      submitData.append('nationality', formData.nationality);
      if (formData.date_of_birth) {
        submitData.append('dob', formData.date_of_birth);
      }

      // Emirates ID
      if (formData.emirates_id) {
        submitData.append('emirates_id', formData.emirates_id);
      }
      if (formData.emirates_id_front) {
        submitData.append('emirates_id_front', formData.emirates_id_front);
      }
      if (formData.emirates_id_back) {
        submitData.append('emirates_id_back', formData.emirates_id_back);
      }

      // Address
      if (formData.street_address) {
        submitData.append('address[label]', formData.address_label);
        submitData.append('address[street_address]', formData.street_address);
        if (formData.building) submitData.append('address[building]', formData.building);
        if (formData.apartment) submitData.append('address[apartment]', formData.apartment);
        submitData.append('address[city]', formData.city);
        submitData.append('address[emirate]', formData.emirate);
        if (formData.service_area_id) {
          submitData.append('address[service_area_id]', formData.service_area_id);
        }
        if (formData.latitude !== null) {
          submitData.append('address[latitude]', formData.latitude.toString());
        }
        if (formData.longitude !== null) {
          submitData.append('address[longitude]', formData.longitude.toString());
        }
      }

      // Phone verification (optional)
      if (formData.firebase_id_token) {
        submitData.append('firebase_id_token', formData.firebase_id_token);
      }

      // Payment (optional)
      if (!formData.skip_payment && formData.card_number) {
        submitData.append('payment[card_number]', formData.card_number);
        submitData.append('payment[cardholder_name]', formData.card_name);
        submitData.append('payment[expiry_date]', formData.card_expiry);
        submitData.append('payment[cvv]', formData.card_cvv);
      }

      // Call API directly with FormData
      const response = await api.post<{ user: any; token: string; message?: string }>('/customer/register', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Handle response - user and token are at root level (from CustomerController::register)
      const user = response.data.user;
      const token = response.data.token;

      if (!user || !token) {
        throw new Error('Invalid response from server');
      }

      // Check if user has customer role
      const hasCustomerRole = user.roles?.some((role: any) => role.name === 'customer') ?? false;
      
      if (!hasCustomerRole) {
        throw new Error('Only customers can sign up to this application.');
      }

      // Store in localStorage
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      // Redirect to return URL if provided, otherwise to home
      const redirectUrl = returnUrl || ROUTES.HOME;
      window.location.href = redirectUrl;
    } catch (err: any) {
      console.error('Registration error', err);
      if (err.response?.data?.errors) {
        const apiErrors: Record<string, string> = {};
        Object.entries(err.response.data.errors).forEach(([key, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            // Map backend field names to frontend field names
            const fieldMapping: Record<string, string> = {
              'first_name': 'first_name',
              'last_name': 'last_name',
              'email': 'email',
              'phone': 'phone',
              'password': 'password',
              'password_confirmation': 'password_confirmation',
              'nationality': 'nationality',
              'emirates_id': 'emirates_id',
              'emirates_id_front': 'emirates_id_front',
              'emirates_id_back': 'emirates_id_back',
              'address.street_address': 'street_address',
              'address.city': 'city',
              'address.emirate': 'emirate',
              'address.service_area_id': 'service_area_id',
              'payment.card_number': 'card_number',
              'payment.cardholder_name': 'card_name',
              'payment.expiry_date': 'card_expiry',
              'payment.cvv': 'card_cvv',
            };
            const frontendField = fieldMapping[key] || key;
            apiErrors[frontendField] = messages[0];
          }
        });
        setFieldErrors(apiErrors);
        
        // Navigate to the step with the first error
        const errorSteps: Record<string, number> = {
          first_name: 0, last_name: 0, nationality: 0, email: 0, phone: 0, password: 0, password_confirmation: 0,
          emirates_id: 1, emirates_id_front: 1, emirates_id_back: 1,
          street_address: 2, city: 2, emirate: 2, service_area_id: 2,
          card_number: 4, card_expiry: 4, card_cvv: 4, card_name: 4,
        };
        const firstErrorKey = Object.keys(apiErrors)[0];
        if (firstErrorKey && errorSteps[firstErrorKey] !== undefined) {
          setCurrentStep(errorSteps[firstErrorKey]);
        }
      } else {
        setGeneralError(err.response?.data?.message || err.message || 'Registration failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step 0 - Account
  const renderStep0 = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <User className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Create Your Account</h2>
        <p className="text-sm text-gray-500">Join as a customer</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => updateFormData('first_name', e.target.value)}
              placeholder="John"
              className={`w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                fieldErrors.first_name
                  ? 'border-red-500 focus:ring-red-500/20'
                  : 'border-gray-300 focus:ring-green-500/20 focus:border-green-500'
              }`}
            />
          </div>
          {fieldErrors.first_name && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.first_name}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => updateFormData('last_name', e.target.value)}
              placeholder="Doe"
              className={`w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                fieldErrors.last_name
                  ? 'border-red-500 focus:ring-red-500/20'
                  : 'border-gray-300 focus:ring-green-500/20 focus:border-green-500'
              }`}
            />
          </div>
          {fieldErrors.last_name && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.last_name}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => updateFormData('date_of_birth', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className={`w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
              fieldErrors.date_of_birth
                ? 'border-red-500 focus:ring-red-500/20'
                : 'border-gray-300 focus:ring-green-500/20 focus:border-green-500'
            }`}
          />
        </div>
        {fieldErrors.date_of_birth && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.date_of_birth}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nationality</label>
        <select
          value={formData.nationality}
          onChange={(e) => updateFormData('nationality', e.target.value)}
          className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
            fieldErrors.nationality
              ? 'border-red-500 focus:ring-red-500/20'
              : 'border-gray-300 focus:ring-green-500/20 focus:border-green-500'
          }`}
        >
          <option value="">Select your nationality</option>
          {NATIONALITIES.map((nat) => (
            <option key={nat} value={nat}>{nat}</option>
          ))}
        </select>
        {fieldErrors.nationality && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.nationality}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            placeholder="john@example.com"
            className={`w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
              fieldErrors.email
                ? 'border-red-500 focus:ring-red-500/20'
                : 'border-gray-300 focus:ring-green-500/20 focus:border-green-500'
            }`}
          />
        </div>
        {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData('phone', e.target.value)}
            placeholder="+971 50 123 4567"
            className={`w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
              fieldErrors.phone
                ? 'border-red-500 focus:ring-red-500/20'
                : 'border-gray-300 focus:ring-green-500/20 focus:border-green-500'
            }`}
          />
        </div>
        {fieldErrors.phone && <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => updateFormData('password', e.target.value)}
            placeholder="Min. 8 characters"
            className={`w-full pl-10 pr-10 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
              fieldErrors.password
                ? 'border-red-500 focus:ring-red-500/20'
                : 'border-gray-300 focus:ring-green-500/20 focus:border-green-500'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {fieldErrors.password && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password_confirmation}
            onChange={(e) => updateFormData('password_confirmation', e.target.value)}
            placeholder="Confirm your password"
            className={`w-full pl-10 pr-10 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
              fieldErrors.password_confirmation
                ? 'border-red-500 focus:ring-red-500/20'
                : 'border-gray-300 focus:ring-green-500/20 focus:border-green-500'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {fieldErrors.password_confirmation && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.password_confirmation}</p>
        )}
      </div>
    </div>
  );

  // Render step 1 - Emirates ID
  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Emirates ID Verification</h3>
        <p className="text-sm text-gray-500">We need to verify your identity</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Emirates ID Number</label>
        <div className="relative">
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={formData.emirates_id}
            onChange={(e) => updateFormData('emirates_id', e.target.value)}
            placeholder="784-XXXX-XXXXXXX-X"
            className={`w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
              fieldErrors.emirates_id
                ? 'border-red-500 focus:ring-red-500/20'
                : 'border-gray-300 focus:ring-green-500/20 focus:border-green-500'
            }`}
          />
        </div>
        {fieldErrors.emirates_id && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.emirates_id}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Emirates ID Front */}
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center ${
            fieldErrors.emirates_id_front ? 'border-red-400' : 'border-gray-300'
          }`}
        >
          <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">Front Side</p>
          <p className="text-xs text-gray-500 mb-2">JPG/PNG (Required)</p>
          {formData.emirates_id_front ? (
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-green-600 truncate max-w-full">
                {formData.emirates_id_front.name}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => emiratesIdFrontRef.current?.click()}
                  className="px-3 py-1 text-xs font-medium text-green-600 border border-green-300 rounded hover:bg-green-50"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => updateFormData('emirates_id_front', null)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => emiratesIdFrontRef.current?.click()}
              className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Upload
            </button>
          )}
          <input
            ref={emiratesIdFrontRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={(e) => handleFileChange(e, 'emirates_id_front')}
            className="hidden"
          />
        </div>

        {/* Emirates ID Back */}
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center ${
            fieldErrors.emirates_id_back ? 'border-red-400' : 'border-gray-300'
          }`}
        >
          <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">Back Side</p>
          <p className="text-xs text-gray-500 mb-2">JPG/PNG (Required)</p>
          {formData.emirates_id_back ? (
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-green-600 truncate max-w-full">
                {formData.emirates_id_back.name}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => emiratesIdBackRef.current?.click()}
                  className="px-3 py-1 text-xs font-medium text-green-600 border border-green-300 rounded hover:bg-green-50"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => updateFormData('emirates_id_back', null)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => emiratesIdBackRef.current?.click()}
              className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Upload
            </button>
          )}
          <input
            ref={emiratesIdBackRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={(e) => handleFileChange(e, 'emirates_id_back')}
            className="hidden"
          />
        </div>
      </div>
      {(fieldErrors.emirates_id_front || fieldErrors.emirates_id_back) && (
        <p className="text-xs text-red-500">
          {fieldErrors.emirates_id_front || fieldErrors.emirates_id_back}
        </p>
      )}

      <div className="p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          Your Emirates ID information is securely stored and used only for verification purposes.
        </p>
      </div>
    </div>
  );

  // Render step 2 - Location
  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Your Location</h3>
        <p className="text-sm text-gray-500">Add your primary address for services</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Label</label>
        <div className="flex gap-2">
          {['Home', 'Work', 'Other'].map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => updateFormData('address_label', label)}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                formData.address_label === label
                  ? 'bg-green-50 border-green-500 text-green-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
        <input
          type="text"
          value={formData.street_address}
          onChange={(e) => updateFormData('street_address', e.target.value)}
          placeholder="123 Main Street"
          className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
            fieldErrors.street_address
              ? 'border-red-500 focus:ring-red-500/20'
              : 'border-gray-300 focus:ring-green-500/20 focus:border-green-500'
          }`}
        />
        {fieldErrors.street_address && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.street_address}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Building</label>
          <input
            type="text"
            value={formData.building}
            onChange={(e) => updateFormData('building', e.target.value)}
            placeholder="Building name/number"
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Apartment/Villa</label>
          <input
            type="text"
            value={formData.apartment}
            onChange={(e) => updateFormData('apartment', e.target.value)}
            placeholder="Apt 101 / Villa 5"
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => updateFormData('city', e.target.value)}
            placeholder="Dubai"
            className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
              fieldErrors.city
                ? 'border-red-500 focus:ring-red-500/20'
                : 'border-gray-300 focus:ring-green-500/20 focus:border-green-500'
            }`}
          />
          {fieldErrors.city && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.city}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Emirate</label>
          <select
            value={formData.emirate}
            onChange={(e) => updateFormData('emirate', e.target.value)}
            className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
              fieldErrors.emirate
                ? 'border-red-500 focus:ring-red-500/20'
                : 'border-gray-300 focus:ring-green-500/20 focus:border-green-500'
            }`}
          >
            <option value="">Select emirate</option>
            {EMIRATES.map((emirate) => (
              <option key={emirate} value={emirate}>{emirate}</option>
            ))}
          </select>
          {fieldErrors.emirate && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.emirate}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Area</label>
        {serviceAreasLoading ? (
          <div className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50">
            <p className="text-gray-500">Loading service areas...</p>
          </div>
        ) : (
          <select
            value={formData.service_area_id}
            onChange={(e) => updateFormData('service_area_id', e.target.value)}
            className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
              fieldErrors.service_area_id
                ? 'border-red-500 focus:ring-red-500/20'
                : 'border-gray-300 focus:ring-green-500/20 focus:border-green-500'
            }`}
          >
            <option value="">Select service area</option>
            {serviceAreas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        )}
        {fieldErrors.service_area_id && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.service_area_id}</p>
        )}
      </div>
    </div>
  );

  // Render step 3 - Phone Verification (simplified - skip for now)
  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Verify Your Phone</h3>
        <p className="text-sm text-gray-500">Phone verification can be completed later</p>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <Phone className="w-8 h-8 text-green-600 mx-auto mb-2" />
        <p className="text-sm text-gray-700 mb-1">Phone number:</p>
        <p className="text-lg font-semibold text-gray-900">{formData.phone || 'Not provided'}</p>
      </div>

      <div className="p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          Phone verification is optional. You can verify your phone number later in your profile settings.
        </p>
      </div>
    </div>
  );

  // Render step 4 - Payment
  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
        <p className="text-sm text-gray-500">Add a card for faster checkout (optional)</p>
      </div>

      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          id="skipPayment"
          checked={formData.skip_payment}
          onChange={(e) => updateFormData('skip_payment', e.target.checked)}
          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
        />
        <label htmlFor="skipPayment" className="text-sm text-gray-700 cursor-pointer">
          Skip for now - I&apos;ll add a payment method later
        </label>
      </div>

      {!formData.skip_payment && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Card Number</label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.card_number}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                  updateFormData('card_number', value);
                }}
                placeholder="1234 5678 9012 3456"
                maxLength={16}
                className={`w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                  fieldErrors.card_number
                    ? 'border-red-500 focus:ring-red-500/20'
                    : 'border-gray-300 focus:ring-green-500/20 focus:border-green-500'
                }`}
              />
            </div>
            {fieldErrors.card_number && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.card_number}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Cardholder Name</label>
            <input
              type="text"
              value={formData.card_name}
              onChange={(e) => updateFormData('card_name', e.target.value)}
              placeholder="John Doe"
              className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                fieldErrors.card_name
                  ? 'border-red-500 focus:ring-red-500/20'
                  : 'border-gray-300 focus:ring-green-500/20 focus:border-green-500'
              }`}
            />
            {fieldErrors.card_name && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.card_name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiry Date</label>
              <input
                type="text"
                value={formData.card_expiry}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  if (value.length > 2) {
                    value = value.slice(0, 2) + '/' + value.slice(2);
                  }
                  updateFormData('card_expiry', value);
                }}
                placeholder="MM/YY"
                maxLength={5}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                  fieldErrors.card_expiry
                    ? 'border-red-500 focus:ring-red-500/20'
                    : 'border-gray-300 focus:ring-green-500/20 focus:border-green-500'
                }`}
              />
              {fieldErrors.card_expiry && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.card_expiry}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">CVV</label>
              <input
                type="password"
                value={formData.card_cvv}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  updateFormData('card_cvv', value);
                }}
                placeholder="123"
                maxLength={4}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                  fieldErrors.card_cvv
                    ? 'border-red-500 focus:ring-red-500/20'
                    : 'border-gray-300 focus:ring-green-500/20 focus:border-green-500'
                }`}
              />
              {fieldErrors.card_cvv && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.card_cvv}</p>
              )}
            </div>
          </div>
        </>
      )}

      <div className="p-3 bg-green-50 rounded-lg">
        <p className="text-xs text-green-700">
          Your payment information is securely processed. We do not store your full card details.
        </p>
      </div>
    </div>
  );

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderStep0();
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Registration Form */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div className="p-6">
          <Link
            href="/auth/login"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 max-w-2xl mx-auto w-full">
          <div className="w-full max-w-md">
            <h1 className="text-[24px] leading-[32px] font-semibold text-gray-900 mb-2">
              Create Your Account
            </h1>
            <p className="text-[15px] leading-[20px] font-normal text-gray-600 mb-8">
              Complete your profile to start booking services
            </p>

            {/* Step Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                {STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  
                  return (
                    <div key={step.id} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                            isActive
                              ? 'bg-gray-900 border-gray-900 text-white'
                              : isCompleted
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'bg-white border-gray-300 text-gray-400'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-xs mt-1 ${isActive ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                          {step.name}
                        </span>
                      </div>
                      {index < STEPS.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-2 -mt-5 ${
                            isCompleted ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {generalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{generalError}</p>
              </div>
            )}

            {/* Step Content */}
            <div className="mb-6">
              {renderCurrentStep()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex-1 px-4 py-3.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium text-[15px] leading-[20px] flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium text-[15px] leading-[20px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Account...' : currentStep === STEPS.length - 1 ? 'Create Account' : 'Next'}
                {!isSubmitting && currentStep < STEPS.length - 1 && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-purple-600 hover:text-purple-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
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
