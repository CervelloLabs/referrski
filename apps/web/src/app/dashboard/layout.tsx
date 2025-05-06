'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Configuration object for Next.js
export const config = {
  runtime: 'edge',
  dynamic: 'force-dynamic'
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
      // Still redirect to home page on error
      router.push('/');
    }
  };

  return (
    <div>
      <div className="fixed top-0 right-0 p-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
} 