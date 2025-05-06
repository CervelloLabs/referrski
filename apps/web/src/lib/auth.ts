import { z } from 'zod';
import { setSessionToken } from './api';

// API URLs - we can configure this based on environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type SignUpData = z.infer<typeof signUpSchema>;
export type SignInData = z.infer<typeof signInSchema>;

export class AuthError extends Error {
  constructor(
    message: string,
    public errors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export const auth = {
  async signUp(data: SignUpData) {
    const validated = signUpSchema.parse(data);
    
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validated),
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.errors) {
        throw new AuthError(result.message || 'Validation error', result.errors);
      }
      throw new AuthError(result.message || 'Failed to sign up');
    }

    return result;
  },

  async signIn(data: SignInData) {
    const validated = signInSchema.parse(data);
    
    const response = await fetch(`${API_URL}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validated),
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.errors) {
        throw new AuthError(result.message || 'Validation error', result.errors);
      }
      throw new AuthError(result.message || 'Failed to sign in');
    }

    // Store the session token
    if (result.data?.session?.access_token) {
      setSessionToken(result.data.session.access_token);
    }

    return result;
  },

  async signOut() {
    const response = await fetch(`${API_URL}/api/auth/signout`, {
      method: 'POST',
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new AuthError(result.message || 'Failed to sign out');
    }

    // Clear the session token
    setSessionToken(null);

    return result;
  }
}; 