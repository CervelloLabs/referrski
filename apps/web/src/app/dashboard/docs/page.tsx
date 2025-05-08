'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Separate the page component from the configuration
const config = {
  runtime: 'edge',
  dynamic: 'force-dynamic'
} as const;

export { config };

function DocsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [defaultTab, setDefaultTab] = useState('installation');
  const appId = searchParams.get('appId');
  
  useEffect(() => {
    if (appId) {
      setDefaultTab('installation');
    }
  }, [appId]);

  return (
    <div className="container px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">SDK Documentation</h1>
      </div>
      
      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="installation">Installation</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
        </TabsList>

        <TabsContent value="installation">
          <Card>
            <CardHeader>
              <CardTitle>Installation</CardTitle>
              <CardDescription>
                Get started with ReferrSki in your React Native application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">1. Install the package</h3>
                <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg">
                  npm install @referrski/react-native
                </pre>
                <p className="text-sm text-muted-foreground mt-2">
                  Or if you&apos;re using yarn:
                </p>
                <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg mt-2">
                  yarn add @referrski/react-native
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Configure ReferrSki in your React Native app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Initialize ReferrSki</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure ReferrSki once at your app&apos;s startup (e.g., in App.tsx or index.js):
                </p>
                <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg">
{`import { ReferrSki } from '@referrski/react-native';

// Initialize ReferrSki once at app startup
ReferrSki.configure({
  appId: '${appId || 'your-app-id'}'
});`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>Usage</CardTitle>
              <CardDescription>
                Learn how to use ReferrSki&apos;s core features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Creating Invitations</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  After configuring ReferrSki, you can create invitations with or without email notifications:
                </p>
                <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg">
{`import { ReferrSki } from '@referrski/react-native';

// Create invitation without email
async function inviteFriend(friendIdentifier: string) {
  try {
    await ReferrSki.createInvitation({
      inviteeIdentifier: friendIdentifier,
      inviterId: 'current-user@example.com',
      metadata: {
        inviterName: 'John Doe'
      }
    });
    // Invitation created successfully
  } catch (error) {
    // Handle error
  }
}

// Create invitation with email notification
async function inviteFriendWithEmail(friendEmail: string) {
  try {
    await ReferrSki.createInvitation({
      inviteeIdentifier: friendEmail,
      inviterId: 'current-user@example.com',
      metadata: {
        inviterName: 'John Doe'
      },
      email: {
        fromName: 'John Doe',
        subject: 'Join our app!',
        content: 'Hey there! I think you\'d love using our app.'
      }
    });
    // Invitation created and email sent successfully
  } catch (error) {
    // Handle error
  }
}

// Verify an invitation
async function verifyInvitation(identifier: string) {
  try {
    await ReferrSki.verifyInvitation(identifier);
    // Invitation is valid
  } catch (error) {
    // Handle error
  }
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components">
          <Card>
            <CardHeader>
              <CardTitle>Components</CardTitle>
              <CardDescription>
                Ready-to-use React Native components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">InviteModal</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  A pre-built modal component for collecting and sending invitations, with optional email notifications:
                </p>
                <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg">
{`import { InviteModal } from '@referrski/react-native';

function MyScreen() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      {/* Button to show the modal */}
      <Button onPress={() => setVisible(true)}>
        Invite Friends
      </Button>

      {/* Invite Modal */}
      <InviteModal
        visible={visible}
        onClose={() => setVisible(false)}
        inviterId="current-user@example.com"
        inviterName="John Doe"
        sendEmail={true} // Optional: set to false to disable email notifications
        onSuccess={() => {
          // Optional: Handle successful invitation
          console.log('Invitation created successfully');
          setVisible(false);
        }}
        style={{
          // Optional: Custom styles
          container: {
            // Modal container styles
          },
          input: {
            // Input field styles
          },
          button: {
            // Submit button styles
          },
          buttonText: {
            // Button text styles
          },
          title: {
            // Title text styles
          },
          error: {
            // Error message styles
          }
        }}
        texts={{
          // Optional: Custom texts
          title: 'Invite Your Friends',
          placeholder: 'Enter friend\'s email or identifier',
          button: 'Send Invitation',
          success: 'Invitation sent!',
          error: 'Failed to send invitation'
        }}
      />
    </>
  );
}`}
                </pre>
                <p className="text-sm text-muted-foreground mt-4">
                  Make sure you&apos;ve called <code>ReferrSki.configure()</code> before using the InviteModal component.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function DocsPage() {
  return (
    <Suspense fallback={
      <div className="container px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Loading Documentation...</h1>
        </div>
      </div>
    }>
      <DocsContent />
    </Suspense>
  );
} 