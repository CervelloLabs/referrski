import { Button } from '@/components/ui/button';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Users, ChartBar, Zap, Check } from 'lucide-react';

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

        {/* Pricing Section */}
        <section id="pricing" className="py-20">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Choose the plan that's right for your business. All plans include full access to our API and dashboard.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Free Tier */}
              <Card className="border-2 border-slate-200">
                <CardHeader>
                  <CardTitle>Free</CardTitle>
                  <div className="mt-4 flex items-baseline text-slate-900">
                    <span className="text-4xl font-bold tracking-tight">$0</span>
                    <span className="ml-1 text-sm text-muted-foreground">/month</span>
                  </div>
                  <CardDescription className="mt-4">
                    Perfect for getting started with user referrals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>100 invites per month</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Dashboard access</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Basic analytics</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>API access</span>
                    </li>
                  </ul>
                  <Button className="w-full mt-8" variant="outline">
                    <AuthDialog
                      defaultMode="sign-up"
                      trigger={<span>Get Started</span>}
                    />
                  </Button>
                </CardContent>
              </Card>

              {/* Pro Tier */}
              <Card className="border-2 border-primary relative">
                <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/2 bg-primary text-white text-xs font-semibold py-1 px-3 rounded-full">
                  Popular
                </div>
                <CardHeader>
                  <CardTitle>Pro</CardTitle>
                  <div className="mt-4 flex items-baseline text-slate-900">
                    <span className="text-4xl font-bold tracking-tight">$9</span>
                    <span className="ml-1 text-sm text-muted-foreground">/month</span>
                  </div>
                  <CardDescription className="mt-4">
                    For growing businesses with more traffic
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>10,000 invites per month</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Advanced analytics</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Webhook integrations</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Email support</span>
                    </li>
                  </ul>
                  <Button className="w-full mt-8">
                    <AuthDialog
                      defaultMode="sign-up"
                      trigger={<span>Subscribe Now</span>}
                    />
                  </Button>
                </CardContent>
              </Card>

              {/* Business Tier */}
              <Card className="border-2 border-slate-200">
                <CardHeader>
                  <CardTitle>Business</CardTitle>
                  <div className="mt-4 flex items-baseline text-slate-900">
                    <span className="text-4xl font-bold tracking-tight">$29</span>
                    <span className="ml-1 text-sm text-muted-foreground">/month</span>
                  </div>
                  <CardDescription className="mt-4">
                    For larger businesses with high volume needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>100,000 invites per month</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Premium analytics</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Custom webhooks</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Priority support</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Custom branding</span>
                    </li>
                  </ul>
                  <Button className="w-full mt-8" variant="outline">
                    <AuthDialog
                      defaultMode="sign-up"
                      trigger={<span>Contact Sales</span>}
                    />
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 text-center text-muted-foreground">
              <p>Need more? <a href="#contact" className="text-primary hover:underline">Contact us</a> for custom enterprise pricing.</p>
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
