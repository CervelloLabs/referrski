import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { fetchApi } from '@/lib/api';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface WebhookTesterProps {
  appId: string;
  webhookUrl: string | null;
  authHeader: string | null;
}

export function WebhookTester({ appId, webhookUrl, authHeader }: WebhookTesterProps) {
  const [activeTab, setActiveTab] = useState('create');
  const [inviterId, setInviterId] = useState('test-inviter-id');
  const [inviteeIdentifier, setInviteeIdentifier] = useState('test@example.com');
  const [metadata, setMetadata] = useState('{\n  "inviterName": "Test User"\n}');
  const [invitationId, setInvitationId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    payload?: any;
  } | null>(null);
  
  const { toast } = useToast();

  const handleCreateInvite = async () => {
    if (!webhookUrl) {
      toast({
        title: 'Webhook URL Required',
        description: 'Please configure a webhook URL in your app settings first.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      let parsedMetadata = {};
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch (e) {
        toast({
          title: 'Invalid JSON',
          description: 'Please provide valid JSON for metadata.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const response = await fetchApi(`/api/apps/${appId}/webhooks/test`, {
        method: 'POST',
        body: {
          type: 'create',
          inviterId,
          inviteeIdentifier,
          metadata: parsedMetadata,
        },
      });

      setResult({
        success: true,
        message: 'Test webhook sent successfully!',
        payload: response.data.payload,
      });

      // Save the invitation ID for verify testing
      if (response.data.payload?.data?.id) {
        setInvitationId(response.data.payload.data.id);
      }
    } catch (error) {
      console.error('Error sending test webhook:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send test webhook',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyInvite = async () => {
    if (!webhookUrl) {
      toast({
        title: 'Webhook URL Required',
        description: 'Please configure a webhook URL in your app settings first.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetchApi(`/api/apps/${appId}/webhooks/test`, {
        method: 'POST',
        body: {
          type: 'verify',
          inviteeIdentifier,
          invitationId: invitationId || undefined,
        },
      });

      setResult({
        success: true,
        message: 'Test verification webhook sent successfully!',
        payload: response.data.payload,
      });
    } catch (error) {
      console.error('Error sending test webhook:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send test webhook',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Webhook Tester</CardTitle>
        <CardDescription>
          Test your webhook integration by sending sample webhook events
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!webhookUrl ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No webhook URL configured</AlertTitle>
            <AlertDescription>
              Please configure a webhook URL in your app settings before testing.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Current webhook URL: <span className="font-mono">{webhookUrl}</span>
              </p>
              {authHeader && (
                <p className="text-sm text-muted-foreground mt-1">
                  Auth header is configured and will be sent with the request.
                </p>
              )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">Test Create Invite</TabsTrigger>
                <TabsTrigger value="verify">Test Verify Invite</TabsTrigger>
              </TabsList>
              
              <TabsContent value="create" className="space-y-4 mt-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="inviterId">Inviter ID</Label>
                    <Input
                      id="inviterId"
                      value={inviterId}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInviterId(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="inviteeIdentifier">Invitee Identifier (Email)</Label>
                    <Input
                      id="inviteeIdentifier"
                      value={inviteeIdentifier}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInviteeIdentifier(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="metadata">Metadata (JSON)</Label>
                    <Textarea
                      id="metadata"
                      value={metadata}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMetadata(e.target.value)}
                      disabled={isLoading}
                      rows={5}
                      className="font-mono text-sm"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleCreateInvite} 
                    disabled={isLoading || !webhookUrl}
                    className="w-full"
                  >
                    {isLoading ? 'Sending...' : 'Send Test Create Invite Webhook'}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="verify" className="space-y-4 mt-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="verifyInviteeIdentifier">Invitee Identifier (Email)</Label>
                    <Input
                      id="verifyInviteeIdentifier"
                      value={inviteeIdentifier}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInviteeIdentifier(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="invitationId">Invitation ID (Optional)</Label>
                    <Input
                      id="invitationId"
                      value={invitationId}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInvitationId(e.target.value)}
                      disabled={isLoading}
                      placeholder="Leave empty to verify by identifier only"
                    />
                    {invitationId && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Using the invitation ID from the previous create test.
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    onClick={handleVerifyInvite} 
                    disabled={isLoading || !webhookUrl}
                    className="w-full"
                  >
                    {isLoading ? 'Sending...' : 'Send Test Verify Invite Webhook'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {result && (
              <div className="mt-6">
                <Alert variant={result.success ? "default" : "destructive"}>
                  {result.success ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>{result.success ? 'Success' : 'Error'}</AlertTitle>
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
                
                {result.success && result.payload && (
                  <div className="mt-4">
                    <Label>Webhook Payload</Label>
                    <div className="p-4 bg-muted rounded-md mt-2">
                      <pre className="text-xs overflow-auto whitespace-pre-wrap">
                        {JSON.stringify(result.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 