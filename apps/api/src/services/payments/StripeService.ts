import Stripe from 'stripe';
import { createClient } from '../../db/client';
import { PaymentPlanService } from './PaymentPlan';

export class StripeService {
  private static instance: StripeService;
  private readonly stripe: Stripe;
  private readonly db = createClient();

  private constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }

  static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  async createCustomer(email: string, userId: string): Promise<Stripe.Customer> {
    const customer = await this.stripe.customers.create({
      email,
      metadata: { userId },
    });

    await this.db.from('profiles').update({
      stripe_customer_id: customer.id,
    }).eq('id', userId);

    return customer;
  }

  async getOrCreateCustomer(userId: string, email: string): Promise<Stripe.Customer> {
    const { data } = await this.db
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (data?.stripe_customer_id) {
      try {
        const customer = await this.stripe.customers.retrieve(data.stripe_customer_id);
        if (customer.deleted) {
          throw new Error('Customer has been deleted');
        }
        return customer as Stripe.Customer;
      } catch (error) {
        return this.createCustomer(email, userId);
      }
    }

    return this.createCustomer(email, userId);
  }

  async createCheckoutSession({
    userId,
    userEmail,
    planId,
    isYearly = false,
    successUrl,
    cancelUrl,
  }: {
    userId: string;
    userEmail: string;
    planId: string;
    isYearly?: boolean;
    successUrl: string;
    cancelUrl: string;
  }): Promise<Stripe.Checkout.Session> {
    const plan = PaymentPlanService.getPlan(planId);
    if (!plan) {
      throw new Error(`Invalid plan ID: ${planId}`);
    }

    const priceId = isYearly ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly;
    if (!priceId) {
      throw new Error(`No price ID available for plan: ${planId}`);
    }

    const customer = await this.getOrCreateCustomer(userId, userEmail);

    return this.stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        metadata: {
          userId,
          planId,
          isYearly: isYearly ? 'true' : 'false',
        },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        planId,
      },
    });
  }

  async createPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
    return this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const { userId, planId } = subscription.metadata as { userId: string; planId: string };
    const status = subscription.status;
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    const cancelAtPeriodEnd = subscription.cancel_at_period_end;

    if (!userId || !planId) {
      throw new Error('Missing metadata in subscription');
    }

    const { error } = await this.db
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        plan_id: planId,
        status,
        stripe_subscription_id: subscription.id,
        current_period_end: currentPeriodEnd,
        cancel_at_period_end: cancelAtPeriodEnd,
        updated_at: new Date(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  async resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  }
} 