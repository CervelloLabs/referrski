import { z } from 'zod';

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type SignUpData = z.infer<typeof signUpSchema>;
export type SignInData = z.infer<typeof signInSchema>;

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export const auth = {
  async signUp(data: SignUpData) {
    const validated = signUpSchema.parse(data);
    
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validated),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new AuthError(error.message || 'Failed to sign up');
    }

    return response.json();
  },

  async signIn(data: SignInData) {
    const validated = signInSchema.parse(data);
    
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validated),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new AuthError(error.message || 'Failed to sign in');
    }

    return response.json();
  },
}; 