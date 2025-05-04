"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth, AuthError } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';

interface SignUpFormProps {
  onToggleMode: () => void;
  onSuccess?: () => void;
}

export function SignUpForm({ onToggleMode, onSuccess }: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await auth.signUp({ email, password });
      toast({
        title: 'Success',
        description: 'Please check your email to verify your account.',
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
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
          required
        />
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