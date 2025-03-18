import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import supabase from '../lib/supabase';

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set',
    hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  
  const password = watch('password');
  
  useEffect(() => {
    // Log Supabase connection info for debugging
    console.log('Supabase connection info:', connectionInfo);
  }, [connectionInfo]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Check if Supabase is configured before attempting signup
      if (!connectionInfo.url || connectionInfo.url === 'Not set' || !connectionInfo.hasKey) {
        throw new Error('Supabase is not properly configured. Please check your environment variables.');
      }
      
      console.log('Attempting Supabase signup...');
      
      // Try Supabase signup
      const { error, data: authData } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          }
        },
      });
      
      console.log('Signup response:', error ? 'Error' : 'Success', error || authData);
      
      if (error) throw error;
      
      // Success message
      toast.success('Account created successfully! Please check your email for verification.');
      
      // Redirect to login page
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Registration failed. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900">
          Create an Account
        </h1>
        <h2 className="mt-2 text-center text-sm text-gray-600">
          Sign up to manage your VPN service
        </h2>
        
        {/* Connection status indicator for debugging */}
        {!connectionInfo.url || connectionInfo.url === 'Not set' || !connectionInfo.hasKey ? (
          <div className="mt-2 py-2 px-4 bg-red-100 text-red-700 text-sm rounded text-center">
            ⚠️ Supabase connection not configured properly
          </div>
        ) : (
          <div className="mt-2 py-2 px-4 bg-green-100 text-green-700 text-sm rounded text-center">
            ✓ Supabase connection configured
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="fullName"
                  type="text"
                  className="input w-full"
                  {...register('fullName', {
                    required: 'Full name is required',
                  })}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  className="input w-full"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  className="input w-full"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  type="password"
                  className="input w-full"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => value === password || 'The passwords do not match',
                  })}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                className={`btn btn-primary w-full flex justify-center ${
                  loading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Sign up'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/login" className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 