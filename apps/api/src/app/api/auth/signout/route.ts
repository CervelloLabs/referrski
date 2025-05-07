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
export async function POST(request: Request) {
  // Step 4: Method validation
  if (!ALLOWED_METHODS.includes(request.method)) {
    return new NextResponse(null, { 
      status: 405,
      headers: {
        'Allow': ALLOWED_METHODS.join(', '),
        'Content-Type': 'application/json',
      }
    });
  }

  // Step 5: Handle OPTIONS (CORS preflight)
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  try {
    // Step 6: Auth verification
    const authResult = await verifyAuth(request);
    if ('error' in authResult) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: authResult.error.message,
        },
        { 
          status: authResult.error.status,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Step 7: Supabase signout
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      throw signOutError;
    }

    // Step 8: Create success response
    const response = NextResponse.json<AuthResponse>(
      {
        success: true,
        message: 'Signed out successfully',
      },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    // Step 9: Clear session cookie
    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
      maxAge: 0, // Expire immediately
    });

    return response;
  } catch (error) {
    console.error('Sign-out error:', error);

    // Step 10: Error handling
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: 'Internal server error',
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
} 