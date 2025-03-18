import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';

export default function ChangePassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  // For password matching validation
  const password = watch('newPassword');

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        router.replace('/login');
        return;
      }
    };
    
    checkUser();
  }, [router]);

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      // Supabase doesn't have a direct method to change password with the current password
      // We can use updateUser to change the password
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) throw error;
      
      toast.success('Password changed successfully');
      
      // Redirect back to settings
      setTimeout(() => {
        router.push('/settings');
      }, 2000);
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Change Password</h1>
          
          <div className="mt-6">
            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
              <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Update Your Password</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Enter your new password below. Your password should be at least 6 characters long.
                  </p>
                </div>
                
                <div className="mt-5 md:mt-0 md:col-span-2">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6">
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
                              value: 6,
                              message: 'Password must be at least 6 characters',
                            },
                          })}
                        />
                        {errors.newPassword && (
                          <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                        )}
                      </div>
                      
                      <div className="col-span-6">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          className="mt-1 input w-full"
                          {...register('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: value => value === password || 'Passwords do not match',
                          })}
                        />
                        {errors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => router.push('/settings')}
                        className="btn btn-secondary"
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