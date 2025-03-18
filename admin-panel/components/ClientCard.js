import { useState } from 'react';
import { FiClipboard, FiDownload, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function ClientCard({ client, inbound, onDelete }) {
  const [loading, setLoading] = useState(false);
  
  const copyConfig = () => {
    // Create sharable config string based on inbound protocol
    let config = '';
    
    if (inbound.protocol === 'vless') {
      // Format VLESS URL
      const serverAddress = window.location.hostname;
      config = `vless://${client.id}@${serverAddress}:${inbound.port}?type=${
        inbound.streamSettings?.network || 'tcp'
      }&security=${
        inbound.streamSettings?.security || 'none'
      }&sni=${
        inbound.streamSettings?.tlsSettings?.serverName || ''
      }#${encodeURIComponent(client.email)}`;
    }
    
    // Copy to clipboard
    navigator.clipboard.writeText(config)
      .then(() => toast.success('Configuration copied to clipboard'))
      .catch(() => toast.error('Failed to copy configuration'));
  };
  
  const downloadConfig = () => {
    // Create config file content
    let config = '';
    const filename = `${client.email.replace(/[^a-z0-9]/gi, '_')}_config.txt`;
    
    if (inbound.protocol === 'vless') {
      const serverAddress = window.location.hostname;
      config = `vless://${client.id}@${serverAddress}:${inbound.port}?type=${
        inbound.streamSettings?.network || 'tcp'
      }&security=${
        inbound.streamSettings?.security || 'none'
      }&sni=${
        inbound.streamSettings?.tlsSettings?.serverName || ''
      }#${encodeURIComponent(client.email)}`;
    }
    
    // Create download link
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(config));
    element.setAttribute('download', filename);
    
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast.success('Configuration downloaded');
  };
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    
    try {
      setLoading(true);
      // API call to delete client would go here
      if (onDelete) await onDelete(client);
      toast.success('Client deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete client');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{client.email}</h3>
          <p className="text-sm text-gray-500 mt-1">
            Created: {new Date(client.created_at || Date.now()).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500 mt-1 font-mono truncate">
            ID: {client.id}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={copyConfig}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Copy configuration"
          >
            <FiClipboard size={18} />
          </button>
          
          <button 
            onClick={downloadConfig}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Download configuration"
          >
            <FiDownload size={18} />
          </button>
          
          <button 
            onClick={handleDelete}
            className={`p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
            title="Delete client"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-gray-500">Protocol:</div>
          <div className="font-medium">{inbound.protocol.toUpperCase()}</div>
          
          <div className="text-gray-500">Port:</div>
          <div className="font-medium">{inbound.port}</div>
          
          <div className="text-gray-500">Network:</div>
          <div className="font-medium">{inbound.streamSettings?.network || 'TCP'}</div>
          
          <div className="text-gray-500">Security:</div>
          <div className="font-medium">{inbound.streamSettings?.security || 'None'}</div>
        </div>
      </div>
    </div>
  );
} 