import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { AuthResponse } from '@/types/auth';
import { verifyAuth } from '@/middleware/auth';

// Step 1: Configure for Edge Runtime
export const runtime = 'edge';  // This tells Next.js to use the Edge Runtime
export const dynamic = 'force-dynamic';  // This ensures the route is not cached

// Step 2: Define allowed methods
const ALLOWED_METHODS = ['POST', 'OPTIONS'];

// Step 3: Add method handling
export async function OPTIONS(request: Request) {
  const requestOrigin = request.headers.get('origin');

  // Define allowed origins for CORS
  // Ensure NEXT_PUBLIC_APP_URL is set correctly in your Vercel environment for the API,
  // pointing to the web app's domain (e.g., https://referrski-web.vercel.app)
  const allowedOrigins = [
    'https://referrski-web.vercel.app', // Explicitly allow production web app
    process.env.NEXT_PUBLIC_APP_URL,   // For local dev or other configured environments
  ].filter(Boolean) as string[]; // Ensure no undefined/empty strings

  let corsOriginToAllow = 'https://referrski-web.vercel.app'; // Default/fallback

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    corsOriginToAllow = requestOrigin;
  }
  
  // It's important that Access-Control-Allow-Origin matches the client's origin

  return new NextResponse(null, {
    status: 204, // No Content for preflight
    headers: {
      'Access-Control-Allow-Origin': corsOriginToAllow,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'POST, OPTIONS', // Methods supported by this route
      'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Headers client might send
      'Access-Control-Max-Age': '86400', // Cache preflight response for 1 day
    },
  });
}

export async function POST(request: Request) {
  // Next.js App Router ensures this function is only called for POST requests.
  // The misplaced method checks from the previous version are removed.

  try {
    const authResult = await verifyAuth(request);
    if ('error' in authResult) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: authResult.error.message,
        },
        { 
          status: authResult.error.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Attempt to sign out from Supabase. 
    // Using { scope: 'local' } invalidates only the current session.
    const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' }); 
    
    if (signOutError) {
      // Log the error for debugging. Even if Supabase fails, proceed to clear cookies.
      console.error('Supabase signOut error:', signOutError.message);
      // Depending on severity, you might choose to return a 500 here,
      // but for signout, clearing client-side state is often prioritized.
    }

    const response = NextResponse.json<AuthResponse>(
      {
        success: true,
        message: 'Signed out successfully',
      },
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN, // Ensure this is correctly set for prod
      maxAge: 0, // Expire immediately
    });

    return response;
  } catch (error: any) {
    console.error('Sign-out route processing error:', error.message);
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: 'Internal server error during sign-out',
      },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 