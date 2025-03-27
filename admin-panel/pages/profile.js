import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';

export default function Profile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState(null);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        router.replace('/login');
        return;
      }
      
      loadUserData(data.session.user.id);
    };
    
    checkUser();
  }, [router]);
  
  const loadUserData = async (userId) => {
    setLoading(true);
    
    try {
      // Get user profile from Supabase
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error('Error loading profile:', profileError);
        toast.error('Error loading profile');
        setLoading(false);
        return;
      }
      
      setUserData(profile);
      
      // Set form values
      setValue('full_name', profile.full_name || '');
      setValue('phone', profile.phone || '');
      setValue('country', profile.country || '');
      
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };
  
  const onSubmit = async (data) => {
    setSaving(true);
    
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        toast.error('Not authenticated');
        return;
      }
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          phone: data.phone,
          country: data.country,
          updated_at: new Date()
        })
        .eq('id', userId);
      
      if (error) {
        throw error;
      }
      
      toast.success('Profile updated successfully');
      
      // Reload user data
      await loadUserData(userId);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Your Profile</h1>
          
          <div className="mt-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-lg text-gray-500">Loading your profile...</span>
              </div>
            ) : (
              <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-1">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Update your personal information here.
                    </p>
                  </div>
                  
                  <div className="mt-5 md:mt-0 md:col-span-2">
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="grid grid-cols-6 gap-6">
                        <div className="col-span-6 sm:col-span-4">
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                          </label>
                          <input
                            type="text"
                            readOnly
                            id="email"
                            value={userData?.email || ''}
                            className="mt-1 input w-full bg-gray-100"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Email cannot be changed.
                          </p>
                        </div>
                        
                        <div className="col-span-6 sm:col-span-4">
                          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                            Full Name
                          </label>
                          <input
                            type="text"
                            id="full_name"
                            className="mt-1 input w-full"
                            {...register('full_name', {
                              required: 'Full name is required',
                            })}
                          />
                          {errors.full_name && (
                            <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
                          )}
                        </div>
                        
                        <div className="col-span-6 sm:col-span-4">
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Phone Number
                          </label>
                          <input
                            type="text"
                            id="phone"
                            className="mt-1 input w-full"
                            {...register('phone')}
                          />
                        </div>
                        
                        <div className="col-span-6 sm:col-span-4">
                          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                            Country
                          </label>
                          <input
                            type="text"
                            id="country"
                            className="mt-1 input w-full"
                            {...register('country')}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                        <button
                          type="submit"
                          className={`btn btn-primary ${saving ? 'opacity-75 cursor-not-allowed' : ''}`}
                          disabled={saving}
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
              <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Account</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage your account settings.
                  </p>
                </div>
                
                <div className="mt-5 md:mt-0 md:col-span-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-md font-medium text-gray-900">Change Password</h4>
                      <p className="text-sm text-gray-500">
                        Update your password to keep your account secure.
                      </p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => router.push('/change-password')}
                      className="btn btn-secondary"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 