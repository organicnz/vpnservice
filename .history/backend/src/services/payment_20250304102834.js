const logger = require('../utils/logger');
const { supabaseAdmin } = require('../utils/supabase');

/**
 * Payment Service - Handles subscription payments
 */
class PaymentService {
  /**
   * Create a payment for a subscription
   * @param {string} userId - User ID
   * @param {number} amount - Payment amount
   * @param {string} planId - Subscription plan ID
   * @returns {Promise<string>} - Payment link
   */
  static async createPayment(userId, amount, planId) {
    try {
      // In a real application, you would integrate with a payment provider
      // like Yookassa (for Russia), PayPal, Stripe, etc.
      
      // For demonstration purposes, we'll just generate a mock payment link
      const paymentId = Math.random().toString(36).substring(2, 15);
      
      // Get plan details
      const { data: plan } = await supabaseAdmin
        .from('plans')
        .select('name')
        .eq('id', planId)
        .single();
      
      // Store payment details in Supabase
      const { data: payment, error } = await supabaseAdmin
        .from('payments')
        .insert({
          user_id: userId,
          payment_id: paymentId,
          amount,
          plan_id: planId,
          plan_name: plan ? plan.name : null,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      logger.info(`Created payment ${payment.id} for user ${userId}, plan ${planId}, amount ${amount}`);
      
      // Generate a mock payment link
      // In production, this would be a real payment gateway URL
      return `https://payment.example.com/pay/${paymentId}?amount=${amount}&currency=RUB`;
    } catch (error) {
      logger.error(`Error creating payment: ${error.message}`);
      throw new Error('Failed to create payment');
    }
  }

  /**
   * Check payment status
   * @param {string} paymentId - Payment ID
   * @returns {Promise<string>} - Payment status
   */
  static async checkPaymentStatus(paymentId) {
    try {
      // Get payment from Supabase
      const { data: payment, error } = await supabaseAdmin
        .from('payments')
        .select('*')
        .eq('payment_id', paymentId)
        .single();
      
      if (error) {
        throw error;
      }
      
      // In a real application, you would call the payment provider's API
      // to check the payment status
      
      logger.info(`Checked payment status for payment ${paymentId}: ${payment.status}`);
      
      return payment.status;
    } catch (error) {
      logger.error(`Error checking payment status: ${error.message}`);
      throw new Error('Failed to check payment status');
    }
  }

  /**
   * Handle payment webhook
   * @param {Object} webhookData - Webhook data from the payment provider
   * @returns {Promise<boolean>} - Success status
   */
  static async handlePaymentWebhook(webhookData) {
    try {
      // Extract payment information from the webhook data
      const { paymentId, status } = webhookData;
      
      // Update payment status in Supabase
      const { data: payment, error } = await supabaseAdmin
        .from('payments')
        .update({ 
          status, 
          payment_date: status === 'completed' ? new Date().toISOString() : null,
          gateway_response: webhookData,
          updated_at: new Date().toISOString()
        })
        .eq('payment_id', paymentId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // If payment is successful, activate the subscription
      if (status === 'completed') {
        // Get the plan details
        const { data: plan } = await supabaseAdmin
          .from('plans')
          .select('*')
          .eq('id', payment.plan_id)
          .single();
        
        if (!plan) {
          throw new Error(`Plan not found: ${payment.plan_id}`);
        }
        
        // Calculate subscription dates
        const now = new Date();
        const endDate = new Date();
        endDate.setDate(now.getDate() + plan.duration);
        
        // Create subscription
        const { data: subscription, error: subError } = await supabaseAdmin
          .from('subscriptions')
          .insert({
            user_id: payment.user_id,
            plan_id: payment.plan_id,
            plan_name: payment.plan_name || plan.name,
            status: 'active',
            traffic_limit: plan.traffic,
            start_date: now.toISOString(),
            end_date: endDate.toISOString(),
            used_traffic: 0,
            payment_id: payment.id
          })
          .select()
          .single();
        
        if (subError) {
          throw subError;
        }
        
        // Update payment with subscription ID
        await supabaseAdmin
          .from('payments')
          .update({ subscription_id: subscription.id })
          .eq('id', payment.id);
        
        logger.info(`Payment ${paymentId} completed, subscription ${subscription.id} activated`);
      }
      
      return true;
    } catch (error) {
      logger.error(`Error handling payment webhook: ${error.message}`);
      throw new Error('Failed to process payment webhook');
    }
  }

  /**
   * Generate invoice
   * @param {string} userId - User ID
   * @param {Object} subscription - Subscription details
   * @returns {Promise<string>} - Invoice URL or data
   */
  static async generateInvoice(userId, subscriptionId) {
    try {
      // Get subscription details
      const { data: subscription, error } = await supabaseAdmin
        .from('subscriptions')
        .select('*, payments(*)')
        .eq('id', subscriptionId)
        .single();
      
      if (error) {
        throw error;
      }
      
      // Generate invoice ID
      const invoiceId = `INV-${Date.now()}-${subscriptionId.substring(0, 6)}`;
      
      // Update payment with invoice ID
      if (subscription.payment_id) {
        await supabaseAdmin
          .from('payments')
          .update({ invoice_id: invoiceId })
          .eq('id', subscription.payment_id);
      }
      
      logger.info(`Generated invoice ${invoiceId} for user ${userId}`);
      
      // In a real application, you would generate a PDF invoice
      // or provide a link to an invoice page
      return `https://yourvpn.com/invoices/${invoiceId}`;
    } catch (error) {
      logger.error(`Error generating invoice: ${error.message}`);
      throw new Error('Failed to generate invoice');
    }
  }

  /**
   * Get payment methods available for the user's region
   * @param {string} countryCode - User's country code
   * @returns {Promise<Array>} - List of available payment methods
   */
  static async getPaymentMethods(countryCode = 'RU') {
    try {
      // For Russian users
      if (countryCode === 'RU') {
        return [
          { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
          { id: 'sbp', name: 'SBP (СБП)', icon: '🏦' },
          { id: 'qiwi', name: 'QIWI Wallet', icon: '💼' },
          { id: 'yoomoney', name: 'YooMoney', icon: '💰' },
          { id: 'crypto', name: 'Cryptocurrency', icon: '₿' }
        ];
      }
      
      // Default international payment methods
      return [
        { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
        { id: 'paypal', name: 'PayPal', icon: '🅿️' },
        { id: 'crypto', name: 'Cryptocurrency', icon: '₿' }
      ];
    } catch (error) {
      logger.error(`Error getting payment methods: ${error.message}`);
      throw new Error('Failed to get payment methods');
    }
  }
}

module.exports = PaymentService; 