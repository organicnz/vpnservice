import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';
import xuiApi from '../lib/xuiApi';

export default function Clients() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [inbounds, setInbounds] = useState([]);
  const [selectedInbound, setSelectedInbound] = useState(null);
  const [clients, setClients] = useState([]);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [newClient, setNewClient] = useState({
    email: '',
    limitIp: 1,
    expiryTime: ''
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        router.replace('/login');
        return;
      }
      
      fetchInbounds();
    };
    
    checkUser();
  }, [router]);

  useEffect(() => {
    // Check if inbound ID is provided in the URL
    if (router.query.inbound && inbounds.length > 0) {
      const inboundId = parseInt(router.query.inbound, 10);
      const inbound = inbounds.find(i => i.id === inboundId);
      if (inbound) {
        setSelectedInbound(inbound);
      }
    }
  }, [router.query.inbound, inbounds]);

  const fetchInbounds = async () => {
    setLoading(true);
    
    try {
      const result = await xuiApi.getInbounds();
      
      if (result.success) {
        setInbounds(result.data || []);
        
        // If there's at least one inbound, select the first one by default
        if (result.data && result.data.length > 0 && !router.query.inbound) {
          setSelectedInbound(result.data[0]);
        }
      } else {
        toast.error('Failed to fetch inbounds data');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred while fetching inbounds');
    } finally {
      setLoading(false);
    }
  };

  const handleInboundSelect = (inbound) => {
    setSelectedInbound(inbound);
    
    // Update URL query parameter
    router.push({
      pathname: router.pathname,
      query: { inbound: inbound.id }
    }, undefined, { shallow: true });
  };

  const getClientsFromInbound = (inbound) => {
    if (!inbound) return [];
    
    try {
      const settings = JSON.parse(inbound.settings || '{}');
      return settings.clients || [];
    } catch (error) {
      console.error('Error parsing inbound settings:', error);
      return [];
    }
  };

  const handleCreateClient = () => {
    setIsCreatingClient(true);
  };

  const handleCancelCreate = () => {
    setIsCreatingClient(false);
    setNewClient({
      email: '',
      limitIp: 1,
      expiryTime: ''
    });
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    
    if (!selectedInbound) {
      toast.error('No inbound selected');
      return;
    }
    
    try {
      // Calculate expiry time (convert days to timestamp)
      let expiryTimeMs = 0;
      if (newClient.expiryTime) {
        const days = parseInt(newClient.expiryTime, 10);
        if (!isNaN(days) && days > 0) {
          expiryTimeMs = Date.now() + (days * 24 * 60 * 60 * 1000);
        }
      }
      
      const result = await xuiApi.createClient(
        selectedInbound.id,
        newClient.email,
        parseInt(newClient.limitIp, 10),
        expiryTimeMs
      );
      
      if (result.success) {
        toast.success('Client created successfully');
        // Refresh inbounds to see the new client
        fetchInbounds();
        handleCancelCreate();
      } else {
        toast.error(result.msg || 'Failed to create client');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred while creating client');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Never';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (e) {
      return 'Invalid date';
    }
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

  const clients = selectedInbound ? getClientsFromInbound(selectedInbound) : [];

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
          
          <div className="mt-6">
            {/* Inbounds Selection */}
            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Select Inbound</h2>
              
              {loading ? (
                <div className="text-center py-4">
                  <svg className="animate-spin mx-auto h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {inbounds.map((inbound) => (
                    <button
                      key={inbound.id}
                      onClick={() => handleInboundSelect(inbound)}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        selectedInbound && selectedInbound.id === inbound.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {inbound.remark || `Inbound #${inbound.id}`} ({inbound.protocol})
                    </button>
                  ))}
                </div>
              )}
              
              {selectedInbound && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-md font-medium text-gray-900">Selected Inbound Details</h3>
                  <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">ID</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedInbound.id}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Protocol</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedInbound.protocol}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Port</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedInbound.port}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>
            
            {/* Clients List */}
            {selectedInbound && (
              <div className="mt-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Client List</h2>
                  <button
                    type="button"
                    onClick={handleCreateClient}
                    className="btn btn-primary"
                  >
                    Add New Client
                  </button>
                </div>
                
                {/* Create Client Form */}
                {isCreatingClient && (
                  <div className="mt-4 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                    <h3 className="text-md font-medium text-gray-900 mb-4">Create New Client</h3>
                    <form onSubmit={handleSubmitCreate}>
                      <div className="grid grid-cols-6 gap-6">
                        <div className="col-span-6 sm:col-span-3">
                          <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700">
                            Email/Name
                          </label>
                          <input
                            type="text"
                            id="clientEmail"
                            className="mt-1 input w-full"
                            placeholder="john@example.com"
                            value={newClient.email}
                            onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                            required
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Used as an identifier for the client
                          </p>
                        </div>
                        
                        <div className="col-span-6 sm:col-span-3">
                          <label htmlFor="clientLimitIp" className="block text-sm font-medium text-gray-700">
                            Device Limit
                          </label>
                          <input
                            type="number"
                            id="clientLimitIp"
                            className="mt-1 input w-full"
                            min="1"
                            max="999"
                            value={newClient.limitIp}
                            onChange={(e) => setNewClient({...newClient, limitIp: e.target.value})}
                            required
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Maximum number of devices that can connect simultaneously
                          </p>
                        </div>
                        
                        <div className="col-span-6">
                          <label htmlFor="clientExpiryTime" className="block text-sm font-medium text-gray-700">
                            Expiry Time (Days)
                          </label>
                          <input
                            type="number"
                            id="clientExpiryTime"
                            className="mt-1 input w-full"
                            min="0"
                            placeholder="30"
                            value={newClient.expiryTime}
                            onChange={(e) => setNewClient({...newClient, expiryTime: e.target.value})}
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Number of days until the client expires. Leave empty for no expiration.
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={handleCancelCreate}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                        >
                          Create Client
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                
                {/* Clients Table */}
                <div className="mt-4 flex flex-col">
                  <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                      <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                        {clients.length === 0 ? (
                          <div className="bg-white p-6 text-center text-gray-500">
                            No clients found for this inbound.
                          </div>
                        ) : (
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Email/Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Device Limit
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Expiry Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  UUID
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                  <span className="sr-only">Actions</span>
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {clients.map((client, index) => (
                                <tr key={client.id || index}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                      {client.email || 'Unnamed Client'}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{client.limitIp || 1}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{formatDate(client.expiryTime)}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="max-w-xs truncate">
                                      {client.id}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                      onClick={() => copyToClipboard(client.id)}
                                      className="text-primary-600 hover:text-primary-900 mr-4"
                                    >
                                      Copy UUID
                                    </button>
                                    {/* Additional actions can be added here */}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Show message if no inbound is selected */}
            {!loading && !selectedInbound && (
              <div className="mt-8 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Inbound Selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Please select an inbound from the list above to view and manage its clients.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 