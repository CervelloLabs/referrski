import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Info, Code, BarChart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
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

interface AppStats {
  uniqueInvites: number;
  completedInvites: number;
}

interface AppCardProps {
  app: App;
  onUpdate?: (updatedApp: App) => void;
}

export function AppCard({ app, onUpdate }: AppCardProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(app.webhookUrl || '');
  const [authHeader, setAuthHeader] = useState(app.authHeader || '');
  const [stats, setStats] = useState<AppStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetchApi(`/api/apps/${app.id}`, {
        method: 'PUT',
        body: {
          name: app.name,
          webhookUrl: webhookUrl || null,
          authHeader: authHeader || null,
        },
      });

      toast({
        title: 'Success',
        description: 'App settings updated successfully',
      });

      setIsSettingsOpen(false);
      onUpdate?.(response.data.app);
    } catch (error) {
      console.error('Error updating app:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update app settings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await fetchApi(`/api/apps/${app.id}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load statistics',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    if (isStatsOpen) {
      fetchStats();
    }
  }, [isStatsOpen]);

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div>
            <CardTitle>{app.name}</CardTitle>
            <CardDescription>
              Created {new Date(app.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/dashboard/docs?appId=${app.id}`)}
              title="View Documentation"
              className="h-8 w-8"
            >
              <Code className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDetailsOpen(true)}
              title="View Details"
              className="h-8 w-8"
            >
              <Info className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsStatsOpen(true)}
              title="View Statistics"
              className="h-8 w-8"
            >
              <BarChart className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSettingsOpen(true)}
              title="Settings"
              className="h-8 w-8"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>App Settings</DialogTitle>
            <DialogDescription>
              Configure your app's webhook URL and authentication header.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSettingsSave} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                type="url"
                placeholder="https://your-api.com/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="authHeader">Authentication Header</Label>
              <Input
                id="authHeader"
                placeholder="token123"
                value={authHeader}
                onChange={(e) => setAuthHeader(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSettingsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>App Details</DialogTitle>
            <DialogDescription>
              View detailed information about your app.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">App ID</h4>
                <p className="text-sm text-muted-foreground break-all">{app.id}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Created At</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(app.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Last Updated</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(app.updatedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Webhook URL</h4>
                <p className="text-sm text-muted-foreground break-all">
                  {app.webhookUrl || 'Not configured'}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Auth Header</h4>
                <p className="text-sm text-muted-foreground">
                  {app.authHeader || 'Not configured'}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog open={isStatsOpen} onOpenChange={setIsStatsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invitation Statistics</DialogTitle>
            <DialogDescription>
              View invitation metrics for your app.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isLoadingStats ? (
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
              </div>
            ) : stats ? (
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-1">Unique Invites Sent</h4>
                  <p className="text-2xl font-bold">{stats.uniqueInvites}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Successful Sign-ups</h4>
                  <p className="text-2xl font-bold">{stats.completedInvites}</p>
                  {stats.uniqueInvites > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {Math.round((stats.completedInvites / stats.uniqueInvites) * 100)}% conversion rate
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Failed to load statistics</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 