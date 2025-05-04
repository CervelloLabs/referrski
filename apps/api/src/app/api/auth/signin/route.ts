import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { AuthResponse } from '@/types/auth';
import { signInSchema } from '@/schemas/auth';
import { ZodError } from 'zod';

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

    // Return success response
    return NextResponse.json<AuthResponse>(
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