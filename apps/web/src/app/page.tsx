import { Button } from '@/components/ui/button';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Users, ChartBar, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold">ReferrSki</h1>
            <nav className="hidden md:flex gap-6">
              <a href="#features" className="text-sm hover:underline">Features</a>
              <a href="#pricing" className="text-sm hover:underline">Pricing</a>
              <a href="#docs" className="text-sm hover:underline">Documentation</a>
            </nav>
          </div>
          <AuthDialog />
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 text-center">
          <div className="container">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Track User Referrals with Ease
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The simplest way to implement and track user referrals in your app.
              No complex integrations, just simple APIs that work.
            </p>
            <div className="flex gap-4 justify-center">
              <AuthDialog
                defaultMode="sign-up"
                trigger={
                  <Button size="lg">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                }
              />
              <Button variant="outline" size="lg">
                View Documentation
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-slate-50">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">
              Everything you need to track referrals
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Users className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Simple Integration</CardTitle>
                  <CardDescription>
                    Integrate referral tracking in minutes with our simple API
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  Add user referral tracking to your app with just a few lines of
                  code. No complex setup required.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <ChartBar className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Detailed Analytics</CardTitle>
                  <CardDescription>
                    Track and analyze your referral program performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  Get detailed insights into your referral program's performance
                  with our comprehensive analytics dashboard.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Zap className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Real-time Updates</CardTitle>
                  <CardDescription>
                    Monitor referral activity as it happens
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  Get instant notifications and track referral activity in
                  real-time. Never miss a conversion.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          © 2024 ReferrSki. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
