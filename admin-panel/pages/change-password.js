import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';

export default function ChangePassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  
  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Password updated successfully');
      reset();
      
      // Give feedback before redirecting
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
      
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Change Password</h1>
          </div>
          
          <div className="mt-6">
            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
              <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Update Password</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Please enter your new password below.
                  </p>
                  <div className="mt-4 text-sm text-gray-500">
                    <p className="font-medium mb-2">Password requirements:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Minimum 8 characters</li>
                      <li>Include at least one uppercase letter</li>
                      <li>Include at least one number</li>
                      <li>Include at least one special character</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-5 md:mt-0 md:col-span-2">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          className="mt-1 input w-full"
                          {...register('newPassword', {
                            required: 'New password is required',
                            minLength: {
                              value: 8,
                              message: 'Password must be at least 8 characters'
                            },
                            pattern: {
                              value: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
                              message: 'Password must include uppercase, number, and special character'
                            }
                          })}
                        />
                        {errors.newPassword && (
                          <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          className="mt-1 input w-full"
                          {...register('confirmPassword', {
                            required: 'Please confirm your new password',
                            validate: value => value === watch('newPassword') || 'Passwords do not match'
                          })}
                        />
                        {errors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                        )}
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => router.push('/profile')}
                          className="btn btn-secondary mr-4"
                          disabled={loading}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className={`btn btn-primary ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                          disabled={loading}
                        >
                          {loading ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 