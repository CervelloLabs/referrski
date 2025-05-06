import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { AuthResponse } from '@/types/auth';

export async function POST(request: Request) {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut();

    // Create response that clears the session cookie
    const response = NextResponse.json<AuthResponse>(
      {
        success: true,
        message: 'Signed out successfully',
      },
      { status: 200 }
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
      { status: 500 }
    );
  }
} 