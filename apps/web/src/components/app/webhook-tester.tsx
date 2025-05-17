import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { WebhookPayload } from '@/types/webhook';
import { sendWebhook } from '@/lib/webhook';
import { v4 as uuidv4 } from 'uuid';

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
    payload?: WebhookPayload;
    responseStatus?: number;
    responseBody?: string;
    responseTime?: number;
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

      // Create the invitation payload
      const invitationId = uuidv4();
      const now = new Date().toISOString();
      
      const payload: WebhookPayload = {
        type: 'invitation.created',
        data: {
          invitationId: invitationId,
          appId: appId,
          inviterId: inviterId,
          inviteeIdentifier: inviteeIdentifier,
          status: 'pending',
          metadata: parsedMetadata,
          createdAt: now,
        },
      };

      // Send the webhook directly
      const startTime = performance.now();
      const webhookResponse = await sendWebhook(webhookUrl, authHeader, payload);
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      // Parse response body
      let responseBody = '';
      try {
        responseBody = await webhookResponse.text();
      } catch (e) {
        responseBody = 'Could not parse response body';
      }

      setResult({
        success: webhookResponse.ok,
        message: webhookResponse.ok 
          ? 'Test webhook sent successfully!' 
          : `Webhook request failed with status: ${webhookResponse.status}`,
        payload,
        responseStatus: webhookResponse.status,
        responseBody,
        responseTime,
      });

      // Save the invitation ID for verify testing
      setInvitationId(invitationId);
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
      // Create a completion payload
      const now = new Date().toISOString();
      const currentInvitationId = invitationId || uuidv4();
      
      const payload: WebhookPayload = {
        type: 'invitation.completed',
        data: {
          invitationId: currentInvitationId,
          appId: appId,
          inviterId: 'test-system',
          inviteeIdentifier: inviteeIdentifier,
          status: 'completed',
          metadata: {},
          createdAt: new Date(new Date().getTime() - 3600000).toISOString(), // 1 hour ago
          completedAt: now,
        },
      };

      // Send the webhook directly
      const startTime = performance.now();
      const webhookResponse = await sendWebhook(webhookUrl, authHeader, payload);
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      // Parse response body
      let responseBody = '';
      try {
        responseBody = await webhookResponse.text();
      } catch (e) {
        responseBody = 'Could not parse response body';
      }

      setResult({
        success: webhookResponse.ok,
        message: webhookResponse.ok 
          ? 'Test verification webhook sent successfully!' 
          : `Webhook request failed with status: ${webhookResponse.status}`,
        payload,
        responseStatus: webhookResponse.status,
        responseBody,
        responseTime,
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
                
                {result.payload && (
                  <div className="mt-4 grid gap-4">
                    <div>
                      <Label>Webhook Payload</Label>
                      <div className="p-4 bg-muted rounded-md mt-2">
                        <pre className="text-xs overflow-auto whitespace-pre-wrap">
                          {JSON.stringify(result.payload, null, 2)}
                        </pre>
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label>Event Type</Label>
                      <div className="p-2 bg-muted rounded-md">
                        <code className="text-xs">{result.payload.type}</code>
                      </div>
                      
                      <Label>Event Data</Label>
                      <div className="p-2 bg-muted rounded-md">
                        <pre className="text-xs overflow-auto whitespace-pre-wrap">
                          {JSON.stringify(result.payload.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                    
                    {result.responseStatus && (
                      <div className="grid gap-2">
                        <Label>Response Status</Label>
                        <div className="p-2 bg-muted rounded-md">
                          <code className={`text-xs ${
                            result.responseStatus >= 200 && result.responseStatus < 300 
                              ? 'text-green-500' 
                              : result.responseStatus >= 400 
                                ? 'text-red-500' 
                                : 'text-yellow-500'
                          }`}>
                            {result.responseStatus}
                          </code>
                        </div>
                      </div>
                    )}
                    
                    {result.responseTime && (
                      <div className="grid gap-2">
                        <Label>Response Time</Label>
                        <div className="p-2 bg-muted rounded-md">
                          <code className="text-xs">
                            {result.responseTime}ms
                          </code>
                        </div>
                      </div>
                    )}
                    
                    {result.responseBody && (
                      <div className="grid gap-2">
                        <Label>Response Body</Label>
                        <div className="p-2 bg-muted rounded-md">
                          <pre className="text-xs overflow-auto whitespace-pre-wrap">
                            {result.responseBody}
                          </pre>
                        </div>
                      </div>
                    )}
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