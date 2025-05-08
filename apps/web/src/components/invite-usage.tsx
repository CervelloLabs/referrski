import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { fetchApi } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface InviteUsage {
  totalInvites: number;
  remainingInvites: number;
  limit: number;
  lastUpdated: string | null;
}

export function InviteUsage() {
  const [usage, setUsage] = useState<InviteUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetchApi('/api/invite-usage');
        setUsage(response.data);
      } catch (error) {
        console.error('Error fetching invite usage:', error);
        toast({
          title: 'Error',
          description: 'Failed to load invite usage. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsage();
  }, [toast]);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
        </CardHeader>
        <CardContent>
          <div className="h-4 bg-gray-200 rounded w-full mt-2"></div>
        </CardContent>
      </Card>
    );
  }

  if (!usage) return null;

  const percentageUsed = (usage.totalInvites / usage.limit) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Usage</CardTitle>
        <CardDescription>
          {usage.remainingInvites} invites remaining
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={percentageUsed} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {usage.totalInvites} of {usage.limit} invites used
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 