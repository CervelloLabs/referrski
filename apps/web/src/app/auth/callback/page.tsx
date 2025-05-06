'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get hash from window only after component is mounted
        if (typeof window !== 'undefined') {
          const hash = window.location.hash;
          if (hash) {
            // Parse the hash fragment
            const params = new URLSearchParams(hash.substring(1));
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            const type = params.get('type');

            if (accessToken && type === 'signup') {
              // Set the session
              const { error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken!,
              });

              if (error) {
                console.error('Error setting session:', error.message);
                router.push('/auth/error');
                return;
              }

              // Redirect to the dashboard or home page
              router.push('/dashboard');
            } else {
              // Handle other auth types or errors
              router.push('/');
            }
          } else {
            // No hash present, redirect to home
            router.push('/');
          }
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        router.push('/auth/error');
      }
    };

    handleAuthCallback();
  }, [router, supabase.auth]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Completing authentication...</h2>
        <p className="text-muted-foreground">Please wait while we verify your account.</p>
      </div>
    </div>
  );
}

// Separate the page component from the configuration
const config = {
  runtime: 'edge',
  dynamic: 'force-dynamic'
} as const;

export { config };

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
} 