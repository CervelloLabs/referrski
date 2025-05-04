"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useSignUp } from '@/hooks/use-sign-up';
import { AuthError } from '@/lib/auth';

interface SignUpFormProps {
  onToggleMode: () => void;
  onSuccess?: () => void;
}

type FieldErrors = {
  email?: string;
  password?: string[];
  confirmPassword?: string;
  general?: string;
};

// Supabase Auth password requirements
const PASSWORD_REQUIREMENTS = {
  minLength: 6,
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>=]/,
};

export function SignUpForm({ onToggleMode, onSuccess }: SignUpFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const { toast } = useToast();

  const validatePassword = (value: string): string[] => {
    const errors: string[] = [];

    if (value.length < PASSWORD_REQUIREMENTS.minLength) {
      errors.push(`Must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
    }
    if (!PASSWORD_REQUIREMENTS.hasUpperCase.test(value)) {
      errors.push('Must contain at least one uppercase letter');
    }
    if (!PASSWORD_REQUIREMENTS.hasLowerCase.test(value)) {
      errors.push('Must contain at least one lowercase letter');
    }
    if (!PASSWORD_REQUIREMENTS.hasNumber.test(value)) {
      errors.push('Must contain at least one number');
    }
    if (!PASSWORD_REQUIREMENTS.hasSpecialChar.test(value)) {
      errors.push('Must contain at least one special character');
    }

    return errors;
  };

  const { signUp, isLoading } = useSignUp({
    onSuccess: () => {
      toast({
        title: 'Account created successfully!',
        description: 'Please check your email (including spam folder) to verify your account.',
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      if (error instanceof AuthError && error.errors) {
        // Handle validation errors from Supabase
        const passwordErrors = error.errors
          .filter((e) => e.field === 'password')
          .map((e) => e.message);
        
        if (passwordErrors.length > 0) {
          setErrors(prev => ({ ...prev, password: passwordErrors }));
        }

        const emailErrors = error.errors
          .filter((e) => e.field === 'email')
          .map((e) => e.message);
        
        if (emailErrors.length > 0) {
          setErrors(prev => ({ ...prev, email: emailErrors[0] }));
        }
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
      newErrors.password = ['Password is required'];
      isValid = false;
    } else {
      const passwordErrors = validatePassword(password);
      if (passwordErrors.length > 0) {
        newErrors.password = passwordErrors;
        isValid = false;
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      await signUp({ email, password });
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
        <Label htmlFor="password">
          Password
          <span className="text-sm text-muted-foreground ml-1">
            (Must meet all requirements below)
          </span>
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            const passwordErrors = validatePassword(e.target.value);
            setErrors(prev => ({
              ...prev,
              password: passwordErrors.length > 0 ? passwordErrors : undefined,
              confirmPassword: undefined
            }));
          }}
          disabled={isLoading}
          required
          className={errors.password ? 'border-red-500' : ''}
        />
        <div className="space-y-1">
          {errors.password?.map((error, index) => (
            <div key={index} className="text-sm text-red-500 dark:text-red-400">
              • {error}
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setErrors(prev => ({ ...prev, confirmPassword: undefined }));
          }}
          disabled={isLoading}
          required
          className={errors.confirmPassword ? 'border-red-500' : ''}
        />
        {errors.confirmPassword && (
          <div className="text-sm text-red-500 dark:text-red-400">
            {errors.confirmPassword}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Signing up...' : 'Sign Up'}
        </Button>
        <Button
          variant="link"
          type="button"
          onClick={onToggleMode}
          disabled={isLoading}
        >
          Already have an account? Sign in
        </Button>
      </div>
    </form>
  );
} 