"use client";

import { useState } from 'react';
import { auth, AuthError, SignUpData } from '@/lib/auth';

interface UseSignUpOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useSignUp({ onSuccess, onError }: UseSignUpOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const signUp = async (data: SignUpData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await auth.signUp(data);
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
    signUp,
    isLoading,
    error,
  };
} 