import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Custom404() {
  const router = useRouter();

  useEffect(() => {
    // Handle redirections for old routes
    const path = window.location.pathname;
    
    if (path.includes('dashboard.html')) {
      // Redirect to the dashboard
      router.replace('/');
      return;
    }
    
    if (path.includes('index.html')) {
      // Redirect to login if not authenticated, or to dashboard if authenticated
      router.replace('/login');
      return;
    }
    
    // Default wait for 3 seconds then redirect to home
    const timeout = setTimeout(() => {
      router.replace('/');
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-9xl font-extrabold text-gray-900">404</h1>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">Page not found</h2>
          <p className="mt-2 text-base text-gray-500">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Redirecting you to the dashboard...
          </p>
        </div>
        <div className="mt-5">
          <button
            onClick={() => router.push('/')}
            className="btn btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
} 