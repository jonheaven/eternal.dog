import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller.js';

const router = Router();
const controller = new PaymentController();

/**
 * POST /payment/create-checkout-session
 * Create Stripe checkout session ($14.20)
 */
router.post(
  '/create-checkout-session',
  controller.createCheckoutSession.bind(controller)
);

/**
 * POST /payment/webhook
 * Handle Stripe webhook (checkout.session.completed)
 * Triggers: inscription, IPFS upload, wallet creation, email
 */
router.post('/webhook', controller.handleWebhook.bind(controller));

export default router;
