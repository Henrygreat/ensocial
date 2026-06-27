import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../database/database.service';

const PLAN_PRICE_IDS: Record<string, string> = {
  SOLO: process.env.STRIPE_PRICE_SOLO ?? 'price_solo',
  PRO: process.env.STRIPE_PRICE_PRO ?? 'price_pro',
  AGENCY: process.env.STRIPE_PRICE_AGENCY ?? 'price_agency',
  ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE ?? 'price_enterprise',
};

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly db: DatabaseService,
    private readonly config: ConfigService,
  ) {
    this.stripe = new Stripe(config.get<string>('stripe.secretKey') ?? '', {
      apiVersion: '2024-06-20' as never,
    });
  }

  async getSubscription(orgId: string) {
    const org = await this.db.organization.findUnique({
      where: { id: orgId },
      include: { subscription: true },
    });

    if (!org) throw new NotFoundException('Organization not found');
    return { plan: org.plan, subscription: org.subscription };
  }

  async createCheckoutSession(orgId: string, userId: string, plan: string, returnUrl: string) {
    const priceId = PLAN_PRICE_IDS[plan.toUpperCase()];
    if (!priceId) throw new BadRequestException(`Unknown plan: ${plan}`);

    const org = await this.db.organization.findUnique({
      where: { id: orgId },
      include: { subscription: true },
    });
    if (!org) throw new NotFoundException('Organization not found');

    const user = await this.db.user.findUniqueOrThrow({ where: { id: userId } });

    let customerId = org.subscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email ?? undefined,
        name: org.name,
        metadata: { orgId, userId },
      });
      customerId = customer.id;
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${returnUrl}?cancelled=true`,
      metadata: { orgId, plan },
      subscription_data: {
        metadata: { orgId, plan },
      },
    });

    return { url: session.url, sessionId: session.id };
  }

  async createPortalSession(orgId: string, returnUrl: string) {
    const sub = await this.db.subscription.findUnique({ where: { organizationId: orgId } });
    if (!sub?.stripeCustomerId) {
      throw new BadRequestException('No billing account found. Please subscribe first.');
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = this.config.get<string>('stripe.webhookSecret') ?? '';

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        this.logger.debug(`Unhandled Stripe event: ${event.type}`);
    }

    return { received: true };
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const orgId = session.metadata?.orgId;
    const plan = session.metadata?.plan;
    if (!orgId || !plan) return;

    const subscription = await this.stripe.subscriptions.retrieve(
      session.subscription as string,
    );

    await this.db.$transaction([
      this.db.organization.update({
        where: { id: orgId },
        data: { plan: plan as never },
      }),
      this.db.subscription.upsert({
        where: { organizationId: orgId },
        create: {
          organizationId: orgId,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0]?.price.id ?? '',
          plan: plan as never,
          status: 'ACTIVE' as never,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
        update: {
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscription.id,
          plan: plan as never,
          status: 'ACTIVE' as never,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      }),
    ]);
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const orgId = subscription.metadata?.orgId;
    if (!orgId) return;

    await this.db.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: (subscription.status === 'active' ? 'ACTIVE' : 'PAST_DUE') as never,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const sub = await this.db.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });
    if (!sub) return;

    await Promise.all([
      this.db.subscription.update({
        where: { id: sub.id },
        data: { status: 'CANCELLED' as never },
      }),
      this.db.organization.update({
        where: { id: sub.organizationId },
        data: { plan: 'FREE' },
      }),
    ]);
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    await this.db.subscription.updateMany({
      where: { stripeCustomerId: invoice.customer as string },
      data: { status: 'PAST_DUE' },
    });
  }
}
