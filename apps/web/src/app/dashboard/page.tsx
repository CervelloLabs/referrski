'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { CreateAppDialog } from '@/components/app/create-app-dialog';
import { fetchApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface App {
  id: string;
  name: string;
  webhookUrl: string | null;
  authHeader: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchApps = async () => {
    try {
      const response = await fetchApi('/api/apps');
      setApps(response.data.apps);
    } catch (error) {
      console.error('Error fetching apps:', error);
      if (error instanceof Error && error.message === 'Not authenticated') {
        router.push('/');
        return;
      }
      toast({
        title: 'Error',
        description: 'Failed to load your apps. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleAppCreated = (newApp: App) => {
    setApps(prevApps => [...prevApps, newApp]);
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Apps</h1>
        <CreateAppDialog onSuccess={handleAppCreated} />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mt-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mt-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : apps.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Apps Yet</CardTitle>
            <CardDescription>
              Create your first app to start managing referrals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateAppDialog
              trigger={
                <Button variant="outline" className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First App
                </Button>
              }
              onSuccess={handleAppCreated}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <Card key={app.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{app.name}</CardTitle>
                <CardDescription>
                  Created {new Date(app.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground truncate">
                    {app.webhookUrl ? `Webhook: ${app.webhookUrl}` : 'No webhook configured'}
                  </p>
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 