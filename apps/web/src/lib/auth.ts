import { z } from 'zod';

// Use relative URLs since we have rewrite rules in place
const API_BASE = '/api';

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
    
    const response = await fetch(`${API_BASE}/auth/signup`, {
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
    
    const response = await fetch(`${API_BASE}/auth/signin`, {
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

    return result;
  },
}; 