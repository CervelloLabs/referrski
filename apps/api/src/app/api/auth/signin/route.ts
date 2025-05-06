import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { AuthResponse } from '@/types/auth';
import { signInSchema } from '@/schemas/auth';
import { ZodError } from 'zod';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = signInSchema.parse(body);
    const { email, password } = validatedData;

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: authError.message,
        },
        { status: 401 }
      );
    }

    if (!authData.user || !authData.session) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: 'Authentication failed',
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
            id: authData.user.id,
            email: authData.user.email!,
          },
          session: {
            access_token: authData.session.access_token,
            refresh_token: authData.session.refresh_token,
          },
        },
      },
      { status: 200 }
    );

    // Set the cookie on the response
    response.cookies.set('session', authData.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
    });

    return response;
  } catch (error) {
    console.error('Sign-in error:', error);

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: 'Validation error',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
} 