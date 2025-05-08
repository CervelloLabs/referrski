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
  appId: '${appId || 'your-app-id'}',
  inviterEmail: 'current-user@example.com'  // The email of the user sending invitations
});`}
                </pre>
                <p className="text-sm text-muted-foreground mt-4">
                  The <code>inviterEmail</code> should be set to the current user&apos;s email address. You can update this value when the user logs in or changes:
                </p>
                <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg mt-2">
{`// Update inviterEmail when user logs in or changes
ReferrSki.configure({
  appId: '${appId || 'your-app-id'}',
  inviterEmail: userEmail
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
                  After configuring ReferrSki, you can use its static methods anywhere in your app to send email invitations:
                </p>
                <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg">
{`import { ReferrSki } from '@referrski/react-native';

// Send an email invitation
async function inviteFriend(friendEmail: string) {
  try {
    await ReferrSki.createInvitation(friendEmail);
    // Email invitation sent successfully
  } catch (error) {
    // Handle error
  }
}

// Verify an email invitation
async function verifyInvitation(email: string) {
  try {
    await ReferrSki.verifyInvitation(email);
    // Email invitation is valid
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
                  A pre-built modal component for collecting and sending email invitations. The modal automatically uses your ReferrSki configuration:
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
        inviterEmail="current-user@example.com"
        onSuccess={() => {
          // Optional: Handle successful invitation
          console.log('Email invitation sent successfully');
          setVisible(false);
        }}
        style={{
          // Optional: Custom styles
          container: {
            // Modal container styles
          },
          input: {
            // Email input field styles
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
          placeholder: 'Enter friend\'s email',
          button: 'Send Invitation',
          success: 'Invitation email sent!',
          error: 'Failed to send invitation'
        }}
      />
    </>
  );
}`}
                </pre>
                <p className="text-sm text-muted-foreground mt-4">
                  Make sure you&apos;ve called <code>ReferrSki.configure()</code> with the correct <code>inviterEmail</code> before using the InviteModal component.
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