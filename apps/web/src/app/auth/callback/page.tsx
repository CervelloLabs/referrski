'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchApi, setSessionToken } from '@/lib/api';

function CallbackContent() {
  const router = useRouter();

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
              // Call our API to verify and set the session
              const response = await fetchApi('/api/auth/callback', {
                method: 'POST',
                body: {
                  access_token: accessToken,
                  refresh_token: refreshToken,
                  type
                }
              });

              if (!response.success) {
                console.error('Error in auth callback:', response.message);
                router.push('/auth/error');
                return;
              }

              // Set the session token in memory
              setSessionToken(accessToken);

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
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Verifying your account...</h2>
        <p className="text-muted-foreground">Please wait while we complete the process.</p>
      </div>
    </div>
  );
}

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