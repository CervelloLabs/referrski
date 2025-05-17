import Stripe from 'stripe';
import { createClient } from '../db/client';

// Initialize Stripe with your secret key (you'll need to set this in your environment variables)
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || '');

// Plans map for the different pricing tiers
export const STRIPE_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Get started with a small number of invites',
    invite_limit: 100,
    price_monthly: 0, // in cents
    price_yearly: 0, // in cents
    stripe_price_id_monthly: null,
    stripe_price_id_yearly: null,
    features: [
      'Dashboard access',
      'Basic analytics',
      'API access',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: '10,000 invites per month',
    invite_limit: 10000,
    price_monthly: 900, // $9 in cents
    price_yearly: 9000, // $90 in cents
    stripe_price_id_monthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY,
    stripe_price_id_yearly: process.env.STRIPE_PRICE_ID_PRO_YEARLY,
    features: [
      'Advanced analytics',
      'Webhook integrations',
      'Email support',
    ],
  },
  business: {
    id: 'business',
    name: 'Business',
    description: '100,000 invites per month',
    invite_limit: 100000,
    price_monthly: 2900, // $29 in cents
    price_yearly: 29000, // $290 in cents
    stripe_price_id_monthly: process.env.STRIPE_PRICE_ID_BUSINESS_MONTHLY,
    stripe_price_id_yearly: process.env.STRIPE_PRICE_ID_BUSINESS_YEARLY,
    features: [
      'Premium analytics',
      'Custom webhooks',
      'Priority support',
      'Custom branding',
    ],
  },
};

export type PlanId = keyof typeof STRIPE_PLANS;

/**
 * Create a new Stripe customer for a user
 */
export async function createCustomer(email: string, userId: string) {
  try {
    const customer = await stripeClient.customers.create({
      email,
      metadata: {
        userId,
      },
    });

    // Store the Stripe customer ID with the user
    const db = createClient();
    await db.from('profiles').update({
      stripe_customer_id: customer.id,
    }).eq('id', userId);

    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
}

/**
 * Get or create a Stripe customer for a user
 */
export async function getOrCreateCustomer(userId: string, email: string) {
  const db = createClient();
  const { data } = await db
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  if (data?.stripe_customer_id) {
    // Customer exists in our database, fetch from Stripe
    try {
      const customer = await stripeClient.customers.retrieve(data.stripe_customer_id);
      if (customer.deleted) {
        throw new Error('Customer has been deleted');
      }
      return customer;
    } catch (error) {
      // If customer doesn't exist in Stripe, create a new one
      return createCustomer(email, userId);
    }
  } else {
    // No customer exists, create one
    return createCustomer(email, userId);
  }
}

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession({
  userId,
  userEmail,
  planId,
  isYearly = false,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  userEmail: string;
  planId: PlanId;
  isYearly?: boolean;
  successUrl: string;
  cancelUrl: string;
}) {
  // Get plan details
  const plan = STRIPE_PLANS[planId];
  const priceId = isYearly ? plan.stripe_price_id_yearly : plan.stripe_price_id_monthly;

  if (!priceId) {
    throw new Error(`No price ID available for plan: ${planId}`);
  }

  // Get or create customer
  const customer = await getOrCreateCustomer(userId, userEmail);

  // Create checkout session
  const session = await stripeClient.checkout.sessions.create({
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

  return session;
}

/**
 * Create a Stripe portal session for managing subscriptions
 */
export async function createPortalSession(customerId: string, returnUrl: string) {
  const session = await stripeClient.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Handle subscription status updates from Stripe webhook
 */
export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const { userId, planId } = subscription.metadata as { userId: string; planId: PlanId };
  const status = subscription.status;
  // Convert Unix timestamp to Date
  const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);
  const cancelAtPeriodEnd = subscription.cancel_at_period_end;

  if (!userId || !planId) {
    console.error('Missing metadata in subscription:', subscription.id);
    return;
  }

  const db = createClient();

  // Update or create subscription in our database
  const { data, error } = await db
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
    console.error('Error updating subscription in database:', error);
    throw error;
  }

  return data;
}

/**
 * Get all available subscription plans
 */
export async function getSubscriptionPlans() {
  return Object.values(STRIPE_PLANS);
}

/**
 * Get a user's current subscription
 */
export async function getUserSubscription(userId: string) {
  const db = createClient();
  const { data, error } = await db
    .from('user_subscriptions')
    .select(`
      id,
      plan_id,
      status,
      stripe_customer_id,
      stripe_subscription_id,
      current_period_end,
      cancel_at_period_end,
      created_at,
      updated_at
    `)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
    throw error;
  }

  if (!data) {
    return {
      plan: STRIPE_PLANS['free'],
      subscription: null
    };
  }

  // Get plan details
  const plan = STRIPE_PLANS[data.plan_id as PlanId] || STRIPE_PLANS['free'];

  return {
    plan,
    subscription: data,
  };
}

/**
 * Cancel a user's subscription at period end
 */
export async function cancelSubscription(subscriptionId: string) {
  return stripeClient.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Resume a canceled subscription
 */
export async function resumeSubscription(subscriptionId: string) {
  return stripeClient.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

export default stripeClient; 