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
          <TabsTrigger value="api">API Reference</TabsTrigger>
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
                <h3 className="text-lg font-semibold mb-2">Install the ReferrSki SDK</h3>
                <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg">
                  npm install @referrski/react-native
                </pre>
                <p className="text-sm text-muted-foreground mt-2">
                  or with yarn/pnpm:
                </p>
                <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg mt-2">
                  yarn add @referrski/react-native
                  # or
                  pnpm add @referrski/react-native
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
                <h3 className="text-lg font-semibold mb-2">Configure the SDK</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Initialize ReferrSki once at your app&apos;s startup:
                </p>
                <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg">
{`import { ReferrSki } from '@referrski/react-native';

ReferrSki.configure({
  appId: '${appId || 'your-app-id'}',
  apiKey: 'your-api-key'
});`}
                </pre>
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg mt-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> Your API key is the "Auth Header" value from your app settings. 
                    Make sure to call this configuration before using any other ReferrSki methods.
                  </p>
                </div>
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
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">1. Send Invitations</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Send referral invitations to friends:
                </p>
                <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg">
{`// Simple invitation
await ReferrSki.sendInvite({
  inviteeIdentifier: 'friend@example.com',
  inviterId: 'current-user-id',
  metadata: {
    inviterName: 'John Doe'
  }
});

// Invitation with email notification
await ReferrSki.sendInvite({
  inviteeIdentifier: 'friend@example.com',
  inviterId: 'current-user-id',
  metadata: {
    inviterName: 'John Doe'
  },
  email: {
    fromName: 'John Doe',
    subject: 'Join our app!',
    content: 'Hey! I think you\\'d love using our app.'
  }
});`}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">2. Verify Signups</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Check if a user has a valid invitation during signup:
                </p>
                <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg">
{`const result = await ReferrSki.verifySignup({
  inviteeIdentifier: 'friend@example.com'
});

if (result.verified) {
  // User completed a referral - grant bonus!
  console.log('Valid referral completed');
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
                <h3 className="text-lg font-semibold mb-2">InviteModal Component</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  A ready-to-use modal for collecting and sending invitations:
                </p>
                <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg">
{`import { InviteModal } from '@referrski/react-native';

function MyScreen() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button onPress={() => setShowModal(true)}>
        Invite Friends
      </Button>

      <InviteModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        inviterId="current-user-id"
        inviterName="John Doe"
        sendEmail={true}
        onSuccess={() => {
          console.log('Invitation sent!');
        }}
      />
    </>
  );
}`}
                </pre>
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4 rounded-lg mt-4">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>Tip:</strong> The InviteModal handles all the UI and validation for you. 
                    Just provide the required props and it&apos;s ready to use!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Reference</CardTitle>
              <CardDescription>
                Detailed reference for all available methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Essential Methods</h3>
                <div className="space-y-4">
                  <div className="border border-slate-200 dark:border-slate-700 p-4 rounded-lg">
                    <h4 className="font-medium mb-2"><code>ReferrSki.configure()</code></h4>
                    <p className="text-sm text-muted-foreground mb-2">Set up the SDK with your app credentials</p>
                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      appId: string, apiKey: string
                    </code>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-700 p-4 rounded-lg">
                    <h4 className="font-medium mb-2"><code>ReferrSki.sendInvite()</code></h4>
                    <p className="text-sm text-muted-foreground mb-2">Send a referral invitation</p>
                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      inviteeIdentifier, inviterId, metadata?, email?
                    </code>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-700 p-4 rounded-lg">
                    <h4 className="font-medium mb-2"><code>ReferrSki.verifySignup()</code></h4>
                    <p className="text-sm text-muted-foreground mb-2">Check if user has valid invitation during signup</p>
                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      inviteeIdentifier → {'{verified: boolean}'}
                    </code>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">InviteModal Props</h3>
                <div className="border border-slate-200 dark:border-slate-700 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><strong>visible:</strong> boolean</div>
                    <div><strong>onClose:</strong> function</div>
                    <div><strong>inviterId:</strong> string</div>
                    <div><strong>inviterName:</strong> string</div>
                    <div><strong>sendEmail?:</strong> boolean</div>
                    <div><strong>onSuccess?:</strong> function</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Plus optional <code>style</code> and <code>texts</code> props for customization
                  </p>
                </div>
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