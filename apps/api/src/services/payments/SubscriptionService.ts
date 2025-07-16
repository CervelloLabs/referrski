import { createClient } from '../../db/client';
import { PaymentPlanService, PaymentPlan } from './PaymentPlan';

export class SubscriptionService {
  private readonly db = createClient();

  async getUserSubscription(userId: string): Promise<{
    plan: PaymentPlan;
    subscription: {
      id: string;
      planId: string;
      status: string;
      stripeCustomerId: string | null;
      stripeSubscriptionId: string | null;
      currentPeriodEnd: Date | null;
      cancelAtPeriodEnd: boolean;
      createdAt: Date;
      updatedAt: Date;
    } | null;
  }> {
    const { data, error } = await this.db
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
        plan: PaymentPlanService.getPlan('free')!,
        subscription: null
      };
    }

    const plan = PaymentPlanService.getPlan(data.plan_id);
    if (!plan) {
      throw new Error(`Invalid plan ID: ${data.plan_id}`);
    }

    return {
      plan,
      subscription: {
        id: data.id,
        planId: data.plan_id,
        status: data.status,
        stripeCustomerId: data.stripe_customer_id,
        stripeSubscriptionId: data.stripe_subscription_id,
        currentPeriodEnd: data.current_period_end,
        cancelAtPeriodEnd: data.cancel_at_period_end,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    };
  }

  async getUserInviteLimit(userId: string): Promise<number> {
    const { plan } = await this.getUserSubscription(userId);
    return plan.inviteLimit;
  }

  async canUserInvite(userId: string, currentInviteCount: number): Promise<boolean> {
    const inviteLimit = await this.getUserInviteLimit(userId);
    return currentInviteCount < inviteLimit;
  }
} 