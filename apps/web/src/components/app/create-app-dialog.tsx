'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Plus } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface CreateAppDialogProps {
  onSuccess?: (app: any) => void;
  trigger?: React.ReactNode;
}

export function CreateAppDialog({ onSuccess, trigger }: CreateAppDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an app name',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetchApi('/api/apps', {
        method: 'POST',
        body: {
          name: name.trim(),
          webhookUrl: null,
          authHeader: null,
        },
      });
      
      toast({
        title: 'Success',
        description: 'App created successfully',
      });

      setOpen(false);
      setName('');
      onSuccess?.(response.data.app);
    } catch (error) {
      console.error('Error creating app:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create app. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create New App
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New App</DialogTitle>
          <DialogDescription>
            Give your app a name to get started. You can configure webhook and authentication settings later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">App Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter app name"
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create App'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 