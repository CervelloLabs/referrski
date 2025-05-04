import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { AuthResponse } from '@/types/auth';
import { signUpSchema } from '@/schemas/auth';
import { ZodError } from 'zod';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = signUpSchema.parse(body);
    const { email, password } = validatedData;

    // Create the user in Supabase Auth with email verification
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (authError) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: authError.message,
        },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: 'User creation failed',
        },
        { status: 400 }
      );
    }

    // Return success response
    return NextResponse.json<AuthResponse>(
      {
        success: true,
        message: 'Please check your email for verification link',
        data: {
          user: {
            id: authData.user.id,
            email: authData.user.email!,
          },
          session: {
            access_token: authData.session?.access_token!,
            refresh_token: authData.session?.refresh_token!,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Sign-up error:', error);

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