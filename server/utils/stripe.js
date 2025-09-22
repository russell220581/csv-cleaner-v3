const { logger } = require('./logger');

class StripeService {
  constructor() {
    this.stripe = null;
    this.isEnabled = false;
    this.stripeAvailable = false;
    this.initialize();
  }

  initialize() {
    try {
      // Try to require stripe dynamically
      const Stripe = require('stripe');
      const stripeKey = process.env.STRIPE_SECRET_KEY;

      if (stripeKey && stripeKey.startsWith('sk_')) {
        this.stripe = new Stripe(stripeKey, {
          apiVersion: '2023-10-16',
        });
        this.isEnabled = true;
        this.stripeAvailable = true;
        logger.info('Stripe integration: ENABLED');
      } else {
        this.isEnabled = false;
        this.stripeAvailable = true;
        logger.warn(
          'Stripe integration: DISABLED - No valid Stripe key provided'
        );
      }
    } catch (error) {
      // Stripe package not installed
      this.isEnabled = false;
      this.stripeAvailable = false;
      logger.warn('Stripe package not installed. Payment features disabled.');
    }
  }

  // Mock Stripe functions for development when Stripe is not available
  async createCustomer(email, userId) {
    if (!this.stripeAvailable) {
      return {
        id: `cus_mock_${Date.now()}`,
        email,
        metadata: { userId: userId.toString() },
      };
    }

    if (!this.isEnabled) {
      return {
        id: `cus_mock_${Date.now()}`,
        email,
        metadata: { userId: userId.toString() },
      };
    }

    try {
      return await this.stripe.customers.create({
        email,
        metadata: { userId: userId.toString() },
      });
    } catch (error) {
      logger.error('Stripe customer creation error:', error);
      throw error;
    }
  }

  async createCheckoutSession(customerId, priceId, successUrl, cancelUrl) {
    if (!this.stripeAvailable || !this.isEnabled) {
      return {
        id: `cs_mock_${Date.now()}`,
        url: `${successUrl}?session_id=mock_${Date.now()}&success=true`,
        mock: true,
      };
    }

    try {
      return await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { tier: this.getTierFromPriceId(priceId) },
      });
    } catch (error) {
      logger.error('Stripe checkout session error:', error);
      throw error;
    }
  }

  async createPortalSession(customerId, returnUrl) {
    if (!this.stripeAvailable || !this.isEnabled) {
      return { url: `${returnUrl}?portal=success` };
    }

    try {
      return await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });
    } catch (error) {
      logger.error('Stripe portal session error:', error);
      throw error;
    }
  }

  async getSubscription(subscriptionId) {
    if (!this.stripeAvailable || !this.isEnabled) {
      return {
        id: subscriptionId,
        status: 'active',
        current_period_end: Date.now() + 30 * 24 * 60 * 60 * 1000,
        mock: true,
      };
    }

    try {
      return await this.stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      logger.error('Stripe get subscription error:', error);
      throw error;
    }
  }

  verifyWebhookSignature(payload, signature) {
    if (!this.stripeAvailable || !this.isEnabled) {
      logger.warn('Webhook verification skipped - Stripe disabled');
      return JSON.parse(payload);
    }

    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET not set');
      }

      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );
    } catch (error) {
      logger.error('Webhook signature verification failed:', error);
      throw error;
    }
  }

  getTierFromPriceId(priceId) {
    if (priceId.includes('pro')) return 'pro';
    if (priceId.includes('agency')) return 'agency';
    return 'free';
  }

  // Check if Stripe is enabled
  isStripeEnabled() {
    return this.isEnabled && this.stripeAvailable;
  }

  // Check if Stripe package is available
  isStripeAvailable() {
    return this.stripeAvailable;
  }
}

// Export singleton instance
module.exports = new StripeService();
