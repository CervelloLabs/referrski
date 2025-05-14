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
  apiKey: 'your-api-key' // Required for authentication
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
                  After configuring ReferrSki, you can send invitations with or without email notifications:
                </p>
                <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg">
{`import { ReferrSki } from '@referrski/react-native';

// Send invitation without email
async function inviteFriend(friendIdentifier: string) {
  try {
    await ReferrSki.sendInvite({
      inviteeIdentifier: friendIdentifier,
      inviterId: 'current-user-id',
      metadata: {
        inviterName: 'John Doe'
      }
    });
    // Invitation sent successfully
  } catch (error) {
    // Handle error
  }
}

// Send invitation with email notification
async function inviteFriendWithEmail(friendEmail: string) {
  try {
    await ReferrSki.sendInvite({
      inviteeIdentifier: friendEmail,
      inviterId: 'current-user-id',
      metadata: {
        inviterName: 'John Doe'
      },
      email: {
        fromName: 'John Doe',
        subject: 'Join our app!',
        content: 'Hey there! I think you\\'d love using our app.'
      }
    });
    // Invitation sent with email notification
  } catch (error) {
    // Handle error
  }
}

// Verify an invitation during signup
async function verifyInvitation(identifier: string) {
  try {
    const result = await ReferrSki.verifySignup({
      inviteeIdentifier: identifier
    });
    
    if (result.verified) {
      // User has a valid invitation
    } else {
      // No valid invitation found
    }
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
        inviterId="current-user-id"
        inviterName="John Doe"
        sendEmail={true} // Optional: set to false to disable email notifications
        onSuccess={() => {
          // Optional: Handle successful invitation
          console.log('Invitation sent successfully');
        }}
        style={{
          // Optional: Custom styles
          container: {
            // Modal card styles
          },
          overlay: {
            // Modal overlay styles
          },
          modalCard: {
            // Modal card container styles
          },
          input: {
            // Input field styles
          },
          inputContainer: {
            // Input container styles
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
          description: {
            // Description text styles
          },
          error: {
            // Error message styles
          },
          closeButton: {
            // Close button styles
          },
          closeButtonText: {
            // Close button text styles
          }
        }}
        texts={{
          // Optional: Custom texts
          title: 'Invite Your Friends',
          placeholder: 'Enter friend\\'s email or identifier',
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

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Reference</CardTitle>
              <CardDescription>
                Detailed reference for all available methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">ReferrSki.configure(config)</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Configures the SDK with your application settings.
                </p>
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-1">Parameters:</p>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li><code>config</code>: Object</li>
                    <li className="ml-5"><code>appId</code>: string - Your ReferrSki application ID</li>
                    <li className="ml-5"><code>apiKey</code>: string - Your ReferrSki API key</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">ReferrSki.sendInvite(options)</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Sends a new invitation, optionally with an email notification.
                </p>
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-1">Parameters:</p>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li><code>options</code>: SendInviteOptions</li>
                    <li className="ml-5"><code>inviteeIdentifier</code>: string - The identifier (e.g., email) of the person to invite</li>
                    <li className="ml-5"><code>inviterId</code>: string - The identifier of the person sending the invitation</li>
                    <li className="ml-5"><code>metadata?</code>: object - Optional metadata about the invitation</li>
                    <li className="ml-5"><code>email?</code>: EmailConfig - Optional email configuration</li>
                    <li className="ml-10"><code>fromName</code>: string - Name to show in the email</li>
                    <li className="ml-10"><code>subject</code>: string - Email subject line</li>
                    <li className="ml-10"><code>content</code>: string - Email content</li>
                  </ul>
                  <p className="text-sm font-medium mt-2 mb-1">Returns:</p>
                  <p className="text-sm"><code>Promise&lt;InvitationResponse&gt;</code></p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">ReferrSki.verifySignup(options)</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Verifies if an invitation exists for the specified identifier during signup.
                </p>
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-1">Parameters:</p>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li><code>options</code>: Object</li>
                    <li className="ml-5"><code>inviteeIdentifier</code>: string - The identifier to verify</li>
                    <li className="ml-5"><code>invitationId?</code>: string - Optional specific invitation ID to verify</li>
                  </ul>
                  <p className="text-sm font-medium mt-2 mb-1">Returns:</p>
                  <p className="text-sm"><code>Promise&lt;{`{ success: boolean; verified: boolean }`}&gt;</code></p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">ReferrSki.deleteInviterData(inviterEmail)</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Deletes all invitations associated with a specific inviter for the current app.
                </p>
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-1">Parameters:</p>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li><code>inviterEmail</code>: string - The email/identifier whose invitations should be deleted</li>
                  </ul>
                  <p className="text-sm font-medium mt-2 mb-1">Returns:</p>
                  <p className="text-sm"><code>Promise&lt;{`{ success: boolean }`}&gt;</code></p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">InviteModal Component</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  A pre-built modal component for collecting and sending invitations.
                </p>
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-1">Props:</p>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li><code>visible</code>: boolean - Controls the visibility of the modal</li>
                    <li><code>onClose</code>: () =&gt; void - Callback function when the modal is closed</li>
                    <li><code>inviterId</code>: string - Identifier of the user sending invitations</li>
                    <li><code>inviterName</code>: string - Name of the user sending invitations</li>
                    <li><code>sendEmail?</code>: boolean - Whether to send email notifications (default: true)</li>
                    <li><code>onSuccess?</code>: () =&gt; void - Optional callback when invitation is sent successfully</li>
                    <li><code>style?</code>: Object - Optional styles for customizing the modal appearance</li>
                    <li className="ml-5"><code>container</code>: StyleProp - Modal card styles</li>
                    <li className="ml-5"><code>overlay</code>: StyleProp - Modal overlay styles</li>
                    <li className="ml-5"><code>modalCard</code>: StyleProp - Modal card container styles</li>
                    <li className="ml-5"><code>input</code>: StyleProp - Input field styles</li>
                    <li className="ml-5"><code>inputContainer</code>: StyleProp - Input container styles</li>
                    <li className="ml-5"><code>button</code>: StyleProp - Submit button styles</li>
                    <li className="ml-5"><code>buttonText</code>: StyleProp - Button text styles</li>
                    <li className="ml-5"><code>title</code>: StyleProp - Title text styles</li>
                    <li className="ml-5"><code>description</code>: StyleProp - Description text styles</li>
                    <li className="ml-5"><code>error</code>: StyleProp - Error message styles</li>
                    <li className="ml-5"><code>closeButton</code>: StyleProp - Close button styles</li>
                    <li className="ml-5"><code>closeButtonText</code>: StyleProp - Close button text styles</li>
                    <li><code>texts?</code>: Object - Optional custom texts for the modal</li>
                    <li className="ml-5"><code>title</code>: string - Modal title</li>
                    <li className="ml-5"><code>placeholder</code>: string - Input placeholder</li>
                    <li className="ml-5"><code>button</code>: string - Button text</li>
                    <li className="ml-5"><code>success</code>: string - Success message</li>
                    <li className="ml-5"><code>error</code>: string - Error message</li>
                  </ul>
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