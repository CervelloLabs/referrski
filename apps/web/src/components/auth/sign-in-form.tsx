"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth, AuthError } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';

interface SignInFormProps {
  onToggleMode: () => void;
  onSuccess?: () => void;
}

export function SignInForm({ onToggleMode, onSuccess }: SignInFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await auth.signIn({ email, password });
      toast({
        title: 'Success',
        description: 'You have been signed in successfully.',
      });
      onSuccess?.();
    } catch (error) {
      const message = error instanceof AuthError 
        ? error.message 
        : 'An unexpected error occurred';
      
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
        />
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