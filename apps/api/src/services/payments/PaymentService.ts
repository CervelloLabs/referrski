import { StripeService } from './StripeService';
import { SubscriptionService } from './SubscriptionService';
import { PaymentPlanService, PaymentPlan } from './PaymentPlan';

export class PaymentService {
  private static instance: PaymentService;
  private readonly stripeService: StripeService;
  private readonly subscriptionService: SubscriptionService;

  private constructor() {
    this.stripeService = StripeService.getInstance();
    this.subscriptionService = new SubscriptionService();
  }

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  async getAvailablePlans(): Promise<PaymentPlan[]> {
    return PaymentPlanService.getAllPlans();
  }

  async getUserSubscription(userId: string) {
    return this.subscriptionService.getUserSubscription(userId);
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
  }) {
    return this.stripeService.createCheckoutSession({
      userId,
      userEmail,
      planId,
      isYearly,
      successUrl,
      cancelUrl,
    });
  }

  async createPortalSession(userId: string, returnUrl: string) {
    const { subscription } = await this.subscriptionService.getUserSubscription(userId);
    if (!subscription?.stripeCustomerId) {
      throw new Error('No active subscription found');
    }
    return this.stripeService.createPortalSession(subscription.stripeCustomerId, returnUrl);
  }

  async handleSubscriptionUpdated(subscription: any) {
    await this.stripeService.handleSubscriptionUpdated(subscription);
  }

  async cancelSubscription(userId: string) {
    const { subscription } = await this.subscriptionService.getUserSubscription(userId);
    if (!subscription?.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }
    return this.stripeService.cancelSubscription(subscription.stripeSubscriptionId);
  }

  async resumeSubscription(userId: string) {
    const { subscription } = await this.subscriptionService.getUserSubscription(userId);
    if (!subscription?.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }
    return this.stripeService.resumeSubscription(subscription.stripeSubscriptionId);
  }

  async canUserInvite(userId: string, currentInviteCount: number): Promise<boolean> {
    return this.subscriptionService.canUserInvite(userId, currentInviteCount);
  }
} 