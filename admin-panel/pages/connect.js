import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';
import xuiApi from '../lib/xuiApi';
import QRCode from 'qrcode.react';

export default function Connect() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [config, setConfig] = useState(null);
  const [connectUrl, setConnectUrl] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [expiryDate, setExpiryDate] = useState(null);

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
        toast.error('Error loading profile');
        setLoading(false);
        return;
      }
      
      setUserData(profile);
      
      // Get user's VPN configuration
      const { data: vpnConfig, error: vpnConfigError } = await supabase
        .from('vpn_configs')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (!vpnConfigError && vpnConfig) {
        setConfig(vpnConfig);
        
        // Set expiry date if available
        if (vpnConfig.expiry_date) {
          setExpiryDate(new Date(vpnConfig.expiry_date));
        }
        
        // Generate connect URL
        if (vpnConfig.config_type === 'vmess') {
          // Format the VMess URL
          setConnectUrl(vpnConfig.connect_url || '');
        }
      }
    } catch (error) {
      toast.error('Error loading data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewConfig = async () => {
    setLoading(true);
    try {
      // Get first inbound for the client (in production, you would select a specific inbound)
      const inboundsResult = await xuiApi.getInbounds();
      
      if (!inboundsResult.success || !inboundsResult.data || inboundsResult.data.length === 0) {
        toast.error('Failed to get inbounds configuration');
        setLoading(false);
        return;
      }
      
      const inbound = inboundsResult.data[0]; // Use first inbound
      
      // Generate a new client config
      const name = userData?.email || userData?.full_name || 'user';
      const result = await xuiApi.createClient(inbound.id, name, 2); // Allow 2 devices
      
      if (result.success) {
        toast.success('Configuration generated successfully');
        
        // Save the new config to Supabase
        const { data: session } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        if (userId) {
          const configData = {
            user_id: userId,
            inbound_id: inbound.id,
            client_id: result.data.id,
            config_type: inbound.protocol,
            connect_url: result.data.connectUrl,
            created_at: new Date(),
            expiry_date: result.data.expiryTime ? new Date(result.data.expiryTime) : null
          };
          
          const { error } = await supabase
            .from('vpn_configs')
            .upsert(configData, { onConflict: 'user_id' });
          
          if (error) {
            console.error('Error saving config to database:', error);
          } else {
            // Reload user data
            await loadUserData(userId);
          }
        }
      } else {
        toast.error(result.msg || 'Failed to generate configuration');
      }
    } catch (error) {
      toast.error('Error generating configuration');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleQRCode = () => {
    setShowQR(!showQR);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success('Copied to clipboard');
      },
      () => {
        toast.error('Failed to copy');
      }
    );
  };

  const isExpired = expiryDate && new Date() > expiryDate;

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Your VPN Connection</h1>
          
          <div className="mt-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-lg text-gray-500">Loading your configuration...</span>
              </div>
            ) : (
              <>
                {/* Status Card */}
                <div className={`p-4 rounded-md ${
                  config && !isExpired ? 'bg-green-50' : 'bg-yellow-50'
                }`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {config && !isExpired ? (
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className={`text-sm font-medium ${
                        config && !isExpired ? 'text-green-800' : 'text-yellow-800'
                      }`}>
                        {config 
                          ? isExpired 
                            ? 'Your VPN configuration has expired' 
                            : 'Your VPN is ready to use'
                          : 'No active VPN configuration found'
                        }
                      </h3>
                      <div className={`mt-2 text-sm ${
                        config && !isExpired ? 'text-green-700' : 'text-yellow-700'
                      }`}>
                        {config ? (
                          <p>
                            {isExpired 
                              ? 'Please generate a new configuration to continue using the service.' 
                              : expiryDate 
                                ? `Valid until ${expiryDate.toLocaleDateString()} ${expiryDate.toLocaleTimeString()}`
                                : 'This configuration has no expiration date.'
                            }
                          </p>
                        ) : (
                          <p>
                            Click the button below to generate your VPN configuration.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Connection Card */}
                {config && !isExpired ? (
                  <div className="mt-6 bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Your Connection Information</h2>
                    
                    {/* Connect URL */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Connection URL
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          readOnly
                          value={connectUrl}
                          className="input flex-grow mr-2"
                        />
                        <button
                          type="button"
                          onClick={() => copyToClipboard(connectUrl)}
                          className="btn btn-secondary"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Use this URL to connect to the VPN with compatible clients
                      </p>
                    </div>
                    
                    {/* QR Code */}
                    <div className="mb-6">
                      <button
                        type="button"
                        onClick={toggleQRCode}
                        className="btn btn-primary"
                      >
                        {showQR ? 'Hide QR Code' : 'Show QR Code'}
                      </button>
                      
                      {showQR && connectUrl && (
                        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg flex justify-center">
                          <QRCode 
                            value={connectUrl}
                            size={200}
                            level="M"
                          />
                        </div>
                      )}
                      <p className="mt-2 text-sm text-gray-500">
                        Scan this QR code with your mobile VPN app to connect
                      </p>
                    </div>
                    
                    {/* Client Apps */}
                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-2">Recommended Apps</h3>
                      <ul className="text-sm text-gray-600 list-disc pl-5">
                        <li>iOS: Shadowrocket, Quantumult X</li>
                        <li>Android: V2rayNG, Clash</li>
                        <li>Windows: V2rayN, Clash for Windows</li>
                        <li>macOS: ClashX, V2rayU</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 bg-white shadow rounded-lg p-6 text-center">
                    <p className="text-gray-600 mb-6">
                      {isExpired 
                        ? 'Your configuration has expired. Please generate a new one.' 
                        : 'No active VPN configuration found. Generate one to get started.'}
                    </p>
                    <button
                      type="button"
                      onClick={generateNewConfig}
                      className={`btn btn-primary ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                      disabled={loading}
                    >
                      {loading ? 'Generating...' : 'Generate VPN Configuration'}
                    </button>
                  </div>
                )}
                
                {/* Help Section */}
                <div className="mt-6 bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Need Help?</h2>
                  <p className="text-gray-600 mb-4">
                    If you're having trouble connecting to the VPN, please check our setup guides or contact support.
                  </p>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => window.open('/help', '_blank')}
                      className="btn btn-secondary"
                    >
                      Setup Guides
                    </button>
                    <button
                      type="button"
                      onClick={() => window.open('mailto:support@yourdomain.com')}
                      className="btn btn-secondary"
                    >
                      Contact Support
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 