"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase';
import { APP_CONFIG } from '../config';

// Mark as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [validResetLink, setValidResetLink] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if the reset link is valid when the component mounts
  useEffect(() => {
    const checkResetLink = async () => {
      const supabase = getSupabaseClient();
      
      // Get the token and email from the URL parameters
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');
      
      if (accessToken && type === 'recovery') {
        // Valid reset link
        setValidResetLink(true);
        
        // Update the session with the access token
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          if (error) {
            console.error('Error setting session:', error);
            setMessage({ text: 'Invalid or expired reset link. Please try again.', type: 'error' });
            setValidResetLink(false);
          }
        } catch (err) {
          console.error('Unexpected error setting session:', err);
          setMessage({ text: 'An unexpected error occurred. Please try again.', type: 'error' });
          setValidResetLink(false);
        }
      } else {
        // Invalid reset link
        setMessage({ text: 'Invalid reset link. Please request a new password reset.', type: 'error' });
        setValidResetLink(false);
      }
    };
    
    checkResetLink();
  }, [searchParams]);

  /**
   * Handle form submission
   * @param e Form submit event
   */
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (!password.trim() || !confirmPassword.trim()) {
      setMessage({ text: 'Please enter and confirm your new password', type: 'error' });
      return;
    }
    
    if (password !== confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }
    
    if (password.length < 8) {
      setMessage({ text: 'Password must be at least 8 characters long', type: 'error' });
      return;
    }
    
    try {
      setLoading(true);
      setMessage(null);
      
      const supabase = getSupabaseClient();
      
      // Update the password
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) {
        setMessage({ text: error.message, type: 'error' });
        return;
      }
      
      // Success message
      setMessage({ 
        text: 'Password has been reset successfully! Redirecting to login...', 
        type: 'success' 
      });
      
      // Clear form
      setPassword('');
      setConfirmPassword('');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      
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
          <p className="text-gray-600 mt-2">Set a new password</p>
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
        
        {validResetLink ? (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <Link href="/forgot-password" className="text-indigo-600 hover:text-indigo-500">
              Request a new password reset
            </Link>
          </div>
        )}
        
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