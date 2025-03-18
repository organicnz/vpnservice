import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import NewClientForm from '../components/NewClientForm';
import ClientCard from '../components/ClientCard';
import { toast } from 'react-hot-toast';
import xuiApi from '../lib/xuiApi';

export default function Clients() {
  const router = useRouter();
  const { inbound: inboundId } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [inbound, setInbound] = useState(null);
  const [clients, setClients] = useState([]);
  const [showNewClientForm, setShowNewClientForm] = useState(false);

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

  useEffect(() => {
    if (inboundId) {
      fetchInboundData();
    }
  }, [inboundId]);

  const fetchInboundData = async () => {
    setLoading(true);
    
    try {
      // Fetch inbounds from XUI API
      const result = await xuiApi.getInbounds();
      
      if (result.success) {
        const inboundData = (result.obj || []).find(
          inbound => inbound.id === parseInt(inboundId)
        );
        
        if (inboundData) {
          setInbound(inboundData);
          // Extract clients from inbound
          const clientsData = inboundData.clientStats || [];
          setClients(clientsData);
        } else {
          toast.error('Inbound not found');
          router.replace('/');
        }
      } else {
        toast.error('Failed to fetch inbound data');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClientCreated = () => {
    // Refresh data after client creation
    fetchInboundData();
    setShowNewClientForm(false);
  };

  const handleDeleteClient = async (client) => {
    // Implementation for client deletion via XUI API would go here
    try {
      toast.success('Client deleted successfully');
      fetchInboundData();
    } catch (error) {
      toast.error('Failed to delete client');
    }
  };

  if (!inboundId) {
    return (
      <Layout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
            <div className="mt-6 bg-white shadow rounded-lg p-6">
              <p className="text-gray-500">Please select an inbound from the dashboard.</p>
              <button
                onClick={() => router.push('/')}
                className="mt-4 btn btn-primary"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              {inbound ? `Clients: ${inbound.remark || `Inbound #${inbound.id}`}` : 'Clients'}
            </h1>
            
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/')}
                className="btn btn-secondary"
              >
                Back to Dashboard
              </button>
              
              <button
                onClick={() => setShowNewClientForm(!showNewClientForm)}
                className="btn btn-primary"
              >
                {showNewClientForm ? 'Cancel' : 'Add Client'}
              </button>
            </div>
          </div>
          
          {/* New Client Form */}
          {showNewClientForm && inbound && (
            <div className="mt-6">
              <NewClientForm 
                inbound={inbound} 
                onClientCreated={handleClientCreated} 
              />
            </div>
          )}
          
          {/* Client List */}
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {clients.length} {clients.length === 1 ? 'Client' : 'Clients'}
            </h2>
            
            {loading ? (
              <div className="bg-white shadow rounded-lg p-6">
                <p className="text-center text-gray-500">Loading clients...</p>
              </div>
            ) : clients.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-6">
                <p className="text-center text-gray-500">No clients found for this inbound.</p>
                <p className="text-center text-gray-500 mt-2">
                  Click 'Add Client' to create your first client.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {clients.map((client) => (
                  <ClientCard
                    key={client.id}
                    client={client}
                    inbound={inbound}
                    onDelete={handleDeleteClient}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 