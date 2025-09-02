'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { useToast } from '@/components/ui/use-toast';
import { fetchApi } from '@/lib/api';

interface Invitation {
  id: string;
  appId: string;
  appName?: string;
  inviterId: string;
  inviteeIdentifier: string;
  status: 'pending' | 'completed' | 'expired';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface InvitationResponse {
  success: boolean;
  message?: string;
  data?: {
    invitation: Invitation;
  };
}

export default function AcceptInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const invitationId = params?.id as string;

  useEffect(() => {
    if (invitationId) {
      fetchInvitationDetails();
    }
  }, [invitationId]);

  const fetchInvitationDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use direct fetch since this endpoint doesn't require auth
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/invitations/${invitationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: InvitationResponse = await response.json();

      if (!data.success || !data.data) {
        setError(data.message || 'Invitation not found or has expired');
        return;
      }

      setInvitation(data.data.invitation);
    } catch (err) {
      console.error('Error fetching invitation:', err);
      setError('Failed to load invitation details');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!invitation) return;

    try {
      setAccepting(true);

      // Call the public verify endpoint to complete the invitation
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/invitations/${invitation.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to accept invitation');
      }

      toast({
        title: 'Invitation accepted!',
        description: 'Thank you for joining. You can now close this page.',
      });

      // Optionally redirect to a success page or close the window
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (err) {
      console.error('Error accepting invitation:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to accept invitation',
        variant: 'destructive',
      });
    } finally {
      setAccepting(false);
    }
  };

  const handleSignUpSuccess = () => {
    setShowAuth(false);
    // After successful signup, automatically accept the invitation
    handleAcceptInvitation();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Loading invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Invitation Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                {error || 'This invitation link is invalid or has expired.'}
              </AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Button onClick={() => router.push('/')} variant="outline">
                Go to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">
            You're Invited!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">Join {invitation.appName || 'this app'}</h2>
            <p className="text-gray-600">
              {invitation.inviterId} has invited you to join {invitation.appName || 'their app'}.
            </p>
            <p className="text-sm text-gray-500">
              Invitation sent to: {invitation.inviteeIdentifier}
            </p>
          </div>

          {invitation.metadata && Object.keys(invitation.metadata).length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Additional Information:</h3>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                {JSON.stringify(invitation.metadata, null, 2)}
              </pre>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={handleAcceptInvitation}
              className="w-full"
              size="lg"
              disabled={accepting}
            >
              {accepting ? 'Accepting...' : 'Accept Invitation'}
            </Button>
            
            <div className="text-center text-sm text-gray-500">
              or
            </div>
            
            <AuthDialog
              trigger={
                <Button variant="outline" className="w-full" size="lg">
                  Sign Up & Accept
                </Button>
              }
              defaultMode="sign-up"
            />
          </div>

          <div className="text-center text-xs text-gray-400">
            <p>By accepting this invitation, you agree to join {invitation.appName || 'the app'}.</p>
            <p className="mt-1">If you didn't expect this invitation, you can safely ignore it.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
