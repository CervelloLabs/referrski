import { z } from 'zod';

export const PaymentPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  inviteLimit: z.number(),
  priceMonthly: z.number(),
  priceYearly: z.number(),
  stripePriceIdMonthly: z.string().nullable(),
  stripePriceIdYearly: z.string().nullable(),
  features: z.array(z.string()),
  isActive: z.boolean().default(true),
});

export type PaymentPlan = z.infer<typeof PaymentPlanSchema>;

export class PaymentPlanService {
  private static readonly PLANS: Record<string, PaymentPlan> = {
    free: {
      id: 'free',
      name: 'Free',
      description: 'Get started with a small number of invites',
      inviteLimit: 100,
      priceMonthly: 0,
      priceYearly: 0,
      stripePriceIdMonthly: null,
      stripePriceIdYearly: null,
      features: [
        'Dashboard access',
        'Basic analytics',
        'API access',
      ],
      isActive: true,
    },
    pro: {
      id: 'pro',
      name: 'Pro',
      description: '10,000 invites per month',
      inviteLimit: 10000,
      priceMonthly: 900, // $9
      priceYearly: 9000, // $90
      stripePriceIdMonthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY || null,
      stripePriceIdYearly: process.env.STRIPE_PRICE_ID_PRO_YEARLY || null,
      features: [
        'Advanced analytics',
        'Webhook integrations',
        'Email support',
      ],
      isActive: true,
    },
    business: {
      id: 'business',
      name: 'Business',
      description: '100,000 invites per month',
      inviteLimit: 100000,
      priceMonthly: 2900, // $29
      priceYearly: 29000, // $290
      stripePriceIdMonthly: process.env.STRIPE_PRICE_ID_BUSINESS_MONTHLY || null,
      stripePriceIdYearly: process.env.STRIPE_PRICE_ID_BUSINESS_YEARLY || null,
      features: [
        'Premium analytics',
        'Custom webhooks',
        'Priority support',
        'Custom branding',
      ],
      isActive: true,
    },
  };

  static getPlan(planId: string): PaymentPlan | null {
    return this.PLANS[planId] || null;
  }

  static getAllPlans(): PaymentPlan[] {
    return Object.values(this.PLANS).filter(plan => plan.isActive);
  }

  static getPlanByStripePriceId(stripePriceId: string): PaymentPlan | null {
    return Object.values(this.PLANS).find(
      plan => 
        plan.stripePriceIdMonthly === stripePriceId || 
        plan.stripePriceIdYearly === stripePriceId
    ) || null;
  }

  static validatePlanId(planId: string): boolean {
    return planId in this.PLANS;
  }
} 