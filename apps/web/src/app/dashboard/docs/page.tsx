'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DocsPage() {
  const searchParams = useSearchParams();
  const [defaultTab, setDefaultTab] = useState('installation');
  const appId = searchParams.get('appId');
  
  useEffect(() => {
    if (appId) {
      setDefaultTab('installation');
    }
  }, [appId]);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">SDK Documentation</h1>
      
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
                  Configure ReferrSki with your app ID (typically in your app&apos;s entry point):
                </p>
                <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg">
{`import { ReferrSki } from '@referrski/react-native';

// Initialize ReferrSki
ReferrSki.configure({
  appId: '${appId || 'your-app-id'}',
  inviterId: 'current-user-id'  // The ID of the user sending invitations
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
                  Use ReferrSki&apos;s static methods to manage invitations:
                </p>
                <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg">
{`import { ReferrSki } from '@referrski/react-native';

async function inviteFriend() {
  try {
    await ReferrSki.createInvitation('friend@example.com');
    // Handle success
  } catch (error) {
    // Handle error
  }
}

// Verify an invitation
async function verifyInvitation() {
  try {
    await ReferrSki.verifyInvitation('user@example.com');
    // Handle success
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
                  A pre-built modal component for sending invitations:
                </p>
                <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg">
{`import { InviteModal } from '@referrski/react-native';

function MyScreen() {
  const [visible, setVisible] = useState(false);

  return (
    <InviteModal
      visible={visible}
      onClose={() => setVisible(false)}
      onSuccess={() => {
        // Handle successful invitation
      }}
      style={{
        // Optional custom styles
        container: { /* ... */ },
        button: { /* ... */ },
      }}
      texts={{
        // Optional custom texts
        title: 'Invite Your Friends',
        button: 'Send Invite',
      }}
    />
  );
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 