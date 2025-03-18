import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';
import { FiUsers, FiServer, FiDatabase } from 'react-icons/fi';
import xuiApi from '../lib/xuiApi';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInbounds: 0,
    totalClients: 0,
    totalTraffic: 0
  });
  const [inbounds, setInbounds] = useState([]);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        router.replace('/login');
        return;
      }
      
      fetchData();
    };
    
    checkUser();
  }, [router]);
  
  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Fetch inbounds from XUI API
      const result = await xuiApi.getInbounds();
      
      if (result.success) {
        const inboundData = result.obj || [];
        setInbounds(inboundData);
        
        // Calculate stats
        const totalClients = inboundData.reduce((acc, curr) => {
          return acc + (curr.clientStats?.length || 0);
        }, 0);
        
        const totalTraffic = inboundData.reduce((acc, curr) => {
          return acc + (curr.up || 0) + (curr.down || 0);
        }, 0);
        
        setStats({
          totalInbounds: inboundData.length,
          totalClients,
          totalTraffic
        });
      } else {
        toast.error('Failed to fetch inbound data');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Format bytes to human readable format
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Stats Cards */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FiServer className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Inbounds
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {loading ? '...' : stats.totalInbounds}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FiUsers className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Clients
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {loading ? '...' : stats.totalClients}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FiDatabase className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Traffic
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {loading ? '...' : formatBytes(stats.totalTraffic)}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Inbounds List */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">Available Inbounds</h2>
            
            {loading ? (
              <div className="mt-4 p-4 bg-white shadow rounded-lg">
                <p className="text-center text-gray-500">Loading inbound data...</p>
              </div>
            ) : inbounds.length === 0 ? (
              <div className="mt-4 p-4 bg-white shadow rounded-lg">
                <p className="text-center text-gray-500">No inbounds found.</p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {inbounds.map((inbound) => (
                  <div key={inbound.id} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          {inbound.remark || `Inbound #${inbound.id}`}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {inbound.protocol.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Port</p>
                          <p className="mt-1 font-medium">{inbound.port}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Clients</p>
                          <p className="mt-1 font-medium">{inbound.clientStats?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Upload</p>
                          <p className="mt-1 font-medium">{formatBytes(inbound.up || 0)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Download</p>
                          <p className="mt-1 font-medium">{formatBytes(inbound.down || 0)}</p>
                        </div>
                      </div>
                      
                      <div className="mt-5">
                        <button
                          type="button"
                          onClick={() => router.push(`/clients?inbound=${inbound.id}`)}
                          className="btn btn-primary w-full"
                        >
                          Manage Clients
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 