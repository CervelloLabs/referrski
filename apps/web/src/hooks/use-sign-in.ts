"use client";

import { useState } from 'react';
import { auth, AuthError, SignInData } from '@/lib/auth';

interface UseSignInOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useSignIn({ onSuccess, onError }: UseSignInOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const signIn = async (data: SignInData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await auth.signIn(data);
      onSuccess?.();
      return response;
    } catch (err) {
      const error = err instanceof AuthError ? err : new Error('An unexpected error occurred');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    isLoading,
    error,
  };
} 