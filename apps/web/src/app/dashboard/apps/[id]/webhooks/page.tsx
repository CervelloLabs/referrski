'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { WebhookTester } from '@/components/app/webhook-tester';
import { fetchApi } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface App {
  id: string;
  name: string;
  webhookUrl: string | null;
  authHeader: string | null;
}

export default function WebhooksPage() {
  const params = useParams();
  const appId = params.id as string;
  const [app, setApp] = useState<App | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const response = await fetchApi(`/api/apps/${appId}`);
        setApp(response.data.app);
      } catch (error) {
        console.error('Error fetching app:', error);
        toast({
          title: 'Error',
          description: 'Failed to load app details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchApp();
  }, [appId, toast]);

  return (
    <div className="py-8">
      <div className="flex items-center mb-6">
        <Link href="/dashboard" passHref>
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{isLoading ? 'Loading...' : app?.name}</h1>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Webhook Testing</h2>
        <p className="text-muted-foreground">
          Test your webhook integration by sending sample webhook events to your configured endpoint.
        </p>
      </div>

      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      ) : app ? (
        <WebhookTester 
          appId={app.id} 
          webhookUrl={app.webhookUrl} 
          authHeader={app.authHeader} 
        />
      ) : (
        <div className="p-4 border border-red-300 bg-red-50 rounded-lg">
          <p className="text-red-800">App not found or you don't have permission to view it.</p>
        </div>
      )}
    </div>
  );
} 