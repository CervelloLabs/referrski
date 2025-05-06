import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { AuthResponse } from '@/types/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { access_token, refresh_token, type } = body;

    if (!access_token || !refresh_token) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: 'Missing tokens',
        },
        { status: 400 }
      );
    }

    // Verify the session with Supabase
    const { data: { user }, error: verifyError } = await supabase.auth.getUser(access_token);

    if (verifyError || !user) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: 'Invalid session',
        },
        { status: 401 }
      );
    }

    // Set secure HTTP-only cookie with the session
    const response = NextResponse.json<AuthResponse>(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email!,
          },
          session: {
            access_token,
            refresh_token,
          },
        },
      },
      { status: 200 }
    );

    // Set the cookie on the response
    response.cookies.set('session', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
    });

    return response;
  } catch (error) {
    console.error('Auth callback error:', error);

    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
} 