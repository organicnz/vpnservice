import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import xuiApi from '../lib/xuiApi';

export default function Settings() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      xuiUrl: process.env.NEXT_PUBLIC_XUI_PANEL_URL || '',
      xuiUsername: '',
      xuiPassword: '',
    }
  });

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
      // Here we would save settings to Supabase or local storage
      // For this example, we'll just show a success message
      localStorage.setItem('xuiSettings', JSON.stringify(data));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setTestingConnection(true);
    
    try {
      const { xuiUrl, xuiUsername, xuiPassword } = await new Promise(resolve => {
        const storedSettings = localStorage.getItem('xuiSettings');
        if (storedSettings) {
          resolve(JSON.parse(storedSettings));
        } else {
          // Use form values if nothing in storage
          const formValues = {
            xuiUrl: document.getElementById('xuiUrl').value,
            xuiUsername: document.getElementById('xuiUsername').value,
            xuiPassword: document.getElementById('xuiPassword').value,
          };
          resolve(formValues);
        }
      });
      
      // Override the xuiApi settings for this test
      xuiApi.baseUrl = xuiUrl;
      xuiApi.username = xuiUsername;
      xuiApi.password = xuiPassword;
      
      // Test login
      const result = await xuiApi.login();
      
      if (result.success) {
        toast.success('Connection successful!');
      } else {
        toast.error('Connection failed: ' + (result.msg || 'Unknown error'));
      }
    } catch (error) {
      toast.error('Connection test failed: ' + (error.message || 'Unknown error'));
    } finally {
      setTestingConnection(false);
    }
  };

  const changePassword = async () => {
    router.push('/change-password');
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          
          <div className="mt-6">
            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
              <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">3x-ui Panel</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Configure your connection to the 3x-ui Panel API.
                  </p>
                </div>
                
                <div className="mt-5 md:mt-0 md:col-span-2">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6">
                        <label htmlFor="xuiUrl" className="block text-sm font-medium text-gray-700">
                          Panel URL
                        </label>
                        <input
                          type="text"
                          id="xuiUrl"
                          className="mt-1 input w-full"
                          placeholder="https://your-panel-url.com"
                          {...register('xuiUrl', {
                            required: 'Panel URL is required',
                            pattern: {
                              value: /^https?:\/\/.+/i,
                              message: 'Must be a valid URL starting with http:// or https://',
                            },
                          })}
                        />
                        {errors.xuiUrl && (
                          <p className="mt-1 text-sm text-red-600">{errors.xuiUrl.message}</p>
                        )}
                      </div>
                      
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="xuiUsername" className="block text-sm font-medium text-gray-700">
                          Username
                        </label>
                        <input
                          type="text"
                          id="xuiUsername"
                          className="mt-1 input w-full"
                          {...register('xuiUsername', {
                            required: 'Username is required',
                          })}
                        />
                        {errors.xuiUsername && (
                          <p className="mt-1 text-sm text-red-600">{errors.xuiUsername.message}</p>
                        )}
                      </div>
                      
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="xuiPassword" className="block text-sm font-medium text-gray-700">
                          Password
                        </label>
                        <input
                          type="password"
                          id="xuiPassword"
                          className="mt-1 input w-full"
                          {...register('xuiPassword', {
                            required: 'Password is required',
                          })}
                        />
                        {errors.xuiPassword && (
                          <p className="mt-1 text-sm text-red-600">{errors.xuiPassword.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={testConnection}
                        className={`btn btn-secondary ${testingConnection ? 'opacity-75 cursor-not-allowed' : ''}`}
                        disabled={testingConnection}
                      >
                        {testingConnection ? 'Testing...' : 'Test Connection'}
                      </button>
                      
                      <button
                        type="submit"
                        className={`btn btn-primary ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save Settings'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mt-6">
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
                      onClick={changePassword}
                      className="btn btn-secondary"
                    >
                      Change Password
                    </button>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-md font-medium text-red-600">Danger Zone</h4>
                        <p className="text-sm text-gray-500">
                          Sign out from your account.
                        </p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={async () => {
                          await supabase.auth.signOut();
                          router.push('/login');
                        }}
                        className="btn bg-red-600 hover:bg-red-700 text-white"
                      >
                        Sign Out
                      </button>
                    </div>
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