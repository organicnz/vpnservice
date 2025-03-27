import { NextResponse } from 'next/server';
import { supabase } from './lib/supabase';

// Define route access patterns
const ADMIN_ROUTES = [
  '/settings',
  '/clients/manage',
  '/configs'
];

const CLIENT_ROUTES = [
  '/connect',
  '/profile',
  '/myconfig'
];

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/reset-password',
  '/404',
  '/_next'
];

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // Allow public routes
  if (PUBLIC_ROUTES.some(route => path.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Create a response object that we'll use if the user isn't authenticated
  const redirectToLogin = NextResponse.redirect(new URL('/login', request.url));
  
  // Get the session from the request cookie
  try {
    // Create a Supabase client based on the request
    const response = NextResponse.next();
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase environment variables missing in middleware");
      return NextResponse.next();
    }
    
    // Get session data from cookie
    const authCookie = request.cookies.get('sb-auth-token')?.value;
    
    if (!authCookie) {
      // No session, redirect to login unless it's a public route
      return redirectToLogin;
    }
    
    // Try to parse the cookie
    let session;
    try {
      session = JSON.parse(authCookie);
    } catch (e) {
      // Invalid cookie
      return redirectToLogin;
    }
    
    // Check if we're trying to access admin routes
    if (ADMIN_ROUTES.some(route => path.startsWith(route))) {
      // Need to verify if user has admin role
      const res = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${session.user.id}&select=role`, {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      });
      
      const userData = await res.json();
      const userRole = userData[0]?.role;
      
      if (userRole !== 'admin') {
        // Not an admin, redirect to client dashboard
        return NextResponse.redirect(new URL('/connect', request.url));
      }
    }
    
    // Check if we're trying to access client routes
    if (CLIENT_ROUTES.some(route => path.startsWith(route))) {
      // Anyone with a valid session can access client routes
      return NextResponse.next();
    }
    
    // Default: allow access to routes not specifically protected
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // In case of any error, just continue
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 