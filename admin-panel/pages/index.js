import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';
import xuiApi from '../lib/xuiApi';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    message: '',
  });
  const [inbounds, setInbounds] = useState([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        router.replace('/login');
        return;
      }
      
      loadData();
    };
    
    checkUser();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    
    try {
      // Check connection to 3x-ui panel
      const loginResult = await xuiApi.login();
      
      if (!loginResult.success) {
        setConnectionStatus({
          connected: false,
          message: loginResult.msg || 'Failed to connect to 3x-ui panel',
        });
        toast.error('Failed to connect to 3x-ui panel. Please check settings.');
        setLoading(false);
        return;
      }
      
      // Get inbounds data
      const inboundsResult = await xuiApi.getInbounds();
      
      if (!inboundsResult.success) {
        setConnectionStatus({
          connected: true,
          message: 'Connected to panel but failed to fetch inbounds',
        });
        toast.error('Failed to fetch inbounds data');
        setLoading(false);
        return;
      }
      
      // Process inbounds data
      const inboundsData = inboundsResult.data || [];
      setInbounds(inboundsData);
      
      // Calculate stats
      let totalClients = 0;
      let activeClients = 0;
      
      inboundsData.forEach(inbound => {
        const settings = JSON.parse(inbound.settings || '{}');
        const clients = settings.clients || [];
        
        totalClients += clients.length;
        
        // Assume all clients are active for now
        // In a real app, you'd check traffic stats
        activeClients += clients.length;
      });
      
      setStats({
        totalClients,
        activeClients,
      });
      
      setConnectionStatus({
        connected: true,
        message: 'Connected to 3x-ui panel',
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setConnectionStatus({
        connected: false,
        message: error.message || 'Unknown error',
      });
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          
          <div className="mt-6">
            {/* Connection Status */}
            <div className={`p-4 rounded-md ${
              connectionStatus.connected ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {connectionStatus.connected ? (
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${
                    connectionStatus.connected ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {connectionStatus.connected ? 'Connected' : 'Not Connected'}
                  </h3>
                  <div className={`mt-2 text-sm ${
                    connectionStatus.connected ? 'text-green-700' : 'text-red-700'
                  }`}>
                    <p>{connectionStatus.message}</p>
                  </div>
                  {!connectionStatus.connected && (
                    <div className="mt-4">
                      <div className="-mx-2 -my-1.5 flex">
                        <button
                          type="button"
                          onClick={() => router.push('/settings')}
                          className="px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Go to Settings
                        </button>
                        <button
                          type="button"
                          onClick={loadData}
                          className="ml-3 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Stats Cards */}
            {connectionStatus.connected && (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* Total Clients Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                        <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Clients
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">
                              {stats.totalClients}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-4 sm:px-6">
                    <div className="text-sm">
                      <a href="/clients" className="font-medium text-primary-600 hover:text-primary-500">
                        View all clients
                        <span className="ml-1">&rarr;</span>
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Active Clients Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                        <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Active Clients
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">
                              {stats.activeClients}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-4 sm:px-6">
                    <div className="text-sm">
                      <a href="/stats" className="font-medium text-primary-600 hover:text-primary-500">
                        View statistics
                        <span className="ml-1">&rarr;</span>
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Inbounds Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                        <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Inbound Configs
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">
                              {inbounds.length}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-4 sm:px-6">
                    <div className="text-sm">
                      <a href="/configs" className="font-medium text-primary-600 hover:text-primary-500">
                        View configurations
                        <span className="ml-1">&rarr;</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Inbounds List */}
            {connectionStatus.connected && inbounds.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900">Inbound Configurations</h2>
                <div className="mt-4 flex flex-col">
                  <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                      <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Protocol
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Port
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Clients
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {inbounds.map((inbound) => {
                              const settings = JSON.parse(inbound.settings || '{}');
                              const clients = settings.clients || [];
                              
                              return (
                                <tr key={inbound.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {inbound.id}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{inbound.protocol}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{inbound.port}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {clients.length}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      Active
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center h-64">
                <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-lg text-gray-500">Loading data...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 