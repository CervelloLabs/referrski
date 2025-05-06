import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { AuthResponse } from '@/types/auth';
import { verifyAuth } from '@/middleware/auth';

// Define allowed methods
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(request: Request) {
  try {
    // Verify the user is authenticated first
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

    // Sign out from Supabase
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      throw signOutError;
    }

    // Create response that clears the session cookie
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

    // Clear the session cookie
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