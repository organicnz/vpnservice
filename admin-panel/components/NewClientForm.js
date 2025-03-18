import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import xuiApi from '../lib/xuiApi';

export default function NewClientForm({ inbound, onClientCreated }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      email: '',
      remark: `Client-${new Date().toISOString().slice(0, 10)}`,
    }
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Create new client using the provided inbound as template
      const result = await xuiApi.createSimilarClient(inbound, data.email);
      
      if (result.success) {
        toast.success('Client created successfully');
        reset();
        if (onClientCreated) onClientCreated();
      } else {
        throw new Error(result.msg || 'Failed to create client');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Client</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email or Identifier
          </label>
          <div className="mt-1">
            <input
              id="email"
              type="text"
              className="input w-full"
              {...register('email', {
                required: 'Email or identifier is required',
              })}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Used to identify this client, can be an email or any name.
          </p>
        </div>
        
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Configuration Summary</h3>
          <div className="bg-gray-50 rounded p-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
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
        
        <div className="mt-4">
          <button
            type="submit"
            className={`btn btn-primary ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Client'}
          </button>
        </div>
      </form>
    </div>
  );
} 