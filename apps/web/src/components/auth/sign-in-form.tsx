"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useSignIn } from '@/hooks/use-sign-in';

interface SignInFormProps {
  onToggleMode: () => void;
  onSuccess?: () => void;
}

type FieldErrors = {
  email?: string;
  password?: string;
  general?: string;
};

export function SignInForm({ onToggleMode, onSuccess }: SignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const { toast } = useToast();

  const { signIn, isLoading } = useSignIn({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'You have been signed in successfully.',
      });
      onSuccess?.();
    },
    onError: (error) => {
      // Handle specific error cases
      if (error.message.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: error.message }));
      } else if (error.message.toLowerCase().includes('password')) {
        setErrors(prev => ({ ...prev, password: error.message }));
      } else {
        setErrors(prev => ({ ...prev, general: error.message }));
      }

      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {};
    let isValid = true;

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email = 'Invalid email address';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      await signIn({ email, password });
    } catch (error) {
      // Error is handled by the hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      {errors.general && (
        <div className="text-sm text-red-500 dark:text-red-400">
          {errors.general}
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors(prev => ({ ...prev, email: undefined }));
          }}
          disabled={isLoading}
          required
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <div className="text-sm text-red-500 dark:text-red-400">
            {errors.email}
          </div>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors(prev => ({ ...prev, password: undefined }));
          }}
          disabled={isLoading}
          required
          className={errors.password ? 'border-red-500' : ''}
        />
        {errors.password && (
          <div className="text-sm text-red-500 dark:text-red-400">
            {errors.password}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
        <Button
          variant="link"
          type="button"
          onClick={onToggleMode}
          disabled={isLoading}
        >
          Don't have an account? Sign up
        </Button>
      </div>
    </form>
  );
} 