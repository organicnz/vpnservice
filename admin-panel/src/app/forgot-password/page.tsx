"use client";

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '@/lib/supabase';
import { APP_CONFIG } from '../config';

// Mark as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  /**
   * Handle form submission
   * @param e Form submit event
   */
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!email.trim()) {
      setMessage({ text: 'Please enter your email address', type: 'error' });
      return;
    }
    
    try {
      setLoading(true);
      setMessage(null);
      
      // Request password reset using our helper function
      const { success, error } = await requestPasswordReset(
        email,
        `${window.location.origin}/reset-password`
      );
      
      if (!success && error) {
        setMessage({ text: error.message, type: 'error' });
        return;
      }
      
      // Success message
      setMessage({ 
        text: 'Password reset email sent. Please check your inbox.', 
        type: 'success' 
      });
      setEmail(''); // Clear the email field
      
    } catch (err) {
      console.error('Password reset error:', err);
      setMessage({ 
        text: 'An unexpected error occurred. Please try again.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="m-auto bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">{APP_CONFIG.app.name}</h1>
          <p className="text-gray-600 mt-2">Reset your password</p>
        </div>
        
        {message && (
          <div className={`p-3 rounded-md mb-6 text-sm ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800' 
              : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-500">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 