const express = require('express');
const { protect } = require('../middleware/auth');
const StripeService = require('../utils/stripe');
const User = require('../models/User');
const { logger } = require('../utils/logger');

const router = express.Router();

router.use(protect);

// Check if payment features are available
router.use((req, res, next) => {
  if (!StripeService.isStripeAvailable()) {
    return res.status(503).json({
      error:
        'Payment features are currently unavailable. Please contact support.',
    });
  }
  next();
});

// Create checkout session for subscription
router.post('/create-checkout-session', async (req, res, next) => {
  try {
    const { priceId, successUrl, cancelUrl } = req.body;

    if (!priceId || !successUrl || !cancelUrl) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Check if user already has an active subscription
    if (req.user.subscriptionStatus === 'active' && req.user.tier !== 'free') {
      return res
        .status(400)
        .json({ error: 'You already have an active subscription' });
    }

    let customerId = req.user.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await StripeService.createCustomer(
        req.user.email,
        req.user._id
      );
      customerId = customer.id;

      // Save customer ID to user
      req.user.stripeCustomerId = customerId;
      await req.user.save();
    }

    const session = await StripeService.createCheckoutSession(
      customerId,
      priceId,
      successUrl,
      cancelUrl
    );

    res.status(200).json({
      status: 'success',
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error) {
    logger.error('Create checkout session error:', error);
    next(error);
  }
});

// Create portal session for subscription management
router.post('/create-portal-session', async (req, res, next) => {
  try {
    const { returnUrl } = req.body;

    if (!req.user.stripeCustomerId) {
      return res.status(400).json({ error: 'No subscription found' });
    }

    const session = await StripeService.createPortalSession(
      req.user.stripeCustomerId,
      returnUrl
    );

    res.status(200).json({
      status: 'success',
      data: {
        url: session.url,
      },
    });
  } catch (error) {
    logger.error('Create portal session error:', error);
    next(error);
  }
});

// Get available plans
router.get('/plans', async (req, res, next) => {
  try {
    const plans = {
      pro: {
        monthly: PRICING.pro_monthly,
        yearly: PRICING.pro_yearly,
        features: [
          'Unlimited file sizes',
          'Unlimited rows',
          'All advanced features',
          'Priority processing',
          'Batch processing (5 files)',
        ],
      },
      agency: {
        monthly: PRICING.agency_monthly,
        yearly: PRICING.agency_yearly,
        features: [
          'Everything in Pro',
          '10 team seats',
          'Batch processing (20 files)',
          'API access',
          'Priority support',
        ],
      },
    };

    res.status(200).json({
      status: 'success',
      data: plans,
    });
  } catch (error) {
    logger.error('Get plans error:', error);
    next(error);
  }
});

// Webhook endpoint for Stripe events
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res, next) => {
    let event;

    try {
      event = StripeService.verifyWebhookSignature(
        req.body,
        req.headers['stripe-signature']
      );
    } catch (error) {
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutCompleted(event.data.object);
          break;

        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object);
          break;

        case 'invoice.payment_failed':
          await handlePaymentFailed(event.data.object);
          break;

        default:
          logger.info(`Unhandled event type: ${event.type}`);
      }

      res.status(200).json({ received: true });
    } catch (error) {
      logger.error('Webhook handler error:', error);
      next(error);
    }
  }
);

// Webhook handlers
async function handleCheckoutCompleted(session) {
  const customerId = session.customer;
  const subscriptionId = session.subscription;
  const tier = session.metadata.tier || 'pro';

  const user = await User.findOne({ stripeCustomerId: customerId });
  if (!user) {
    logger.error(`User not found for customer: ${customerId}`);
    return;
  }

  user.tier = tier;
  user.subscriptionStatus = 'active';
  await user.save();

  logger.info(`User ${user.email} upgraded to ${tier} tier`);
}

async function handleSubscriptionUpdated(subscription) {
  const customerId = subscription.customer;
  const status = subscription.status;

  const user = await User.findOne({ stripeCustomerId: customerId });
  if (!user) return;

  user.subscriptionStatus = status;
  await user.save();

  logger.info(`Subscription updated for ${user.email}: ${status}`);
}

async function handleSubscriptionDeleted(subscription) {
  const customerId = subscription.customer;

  const user = await User.findOne({ stripeCustomerId: customerId });
  if (!user) return;

  user.tier = 'free';
  user.subscriptionStatus = 'canceled';
  await user.save();

  logger.info(`User ${user.email} downgraded to free tier`);
}

async function handlePaymentFailed(invoice) {
  const customerId = invoice.customer;

  const user = await User.findOne({ stripeCustomerId: customerId });
  if (!user) return;

  user.subscriptionStatus = 'past_due';
  await user.save();

  logger.info(`Payment failed for ${user.email}, status: past_due`);
}

module.exports = router;
