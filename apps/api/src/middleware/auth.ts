import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface AuthError {
  message: string;
  status: number;
}

interface AuthSuccess {
  user: {
    id: string;
    email: string;
  };
}

type AuthResult = { error: AuthError } | AuthSuccess;

export async function verifyAuth(request: Request): Promise<AuthResult> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      error: {
        message: 'Missing or invalid authorization header',
        status: 401,
      },
    };
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return {
      error: {
        message: 'Invalid or expired token',
        status: 401,
      },
    };
  }

  return { user: { id: user.id, email: user.email! } };
} 