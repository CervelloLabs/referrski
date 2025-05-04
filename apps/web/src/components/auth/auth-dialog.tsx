"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SignUpForm } from './sign-up-form';
import { SignInForm } from './sign-in-form';
import { Button } from '../ui/button';


interface AuthDialogProps {
  trigger?: React.ReactNode;
  defaultMode?: 'sign-in' | 'sign-up';
}


export function AuthDialog({ trigger, defaultMode = 'sign-in' }: AuthDialogProps) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>(defaultMode);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    setOpen(false);
    router.push('/dashboard');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="default">Sign In</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'sign-in' ? 'Welcome back!' : 'Create an account'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'sign-in'
              ? 'Sign in to your account to continue'
              : 'Sign up for a new account to get started'}
          </DialogDescription>
        </DialogHeader>
        {mode === 'sign-in' ? (
          <SignInForm onToggleMode={() => setMode('sign-up')} onSuccess={handleSuccess} />
        ) : (
          <SignUpForm onToggleMode={() => setMode('sign-in')} onSuccess={handleSuccess} />
        )}
      </DialogContent>
    </Dialog>
  );
} 