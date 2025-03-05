// Supabase Subscription model helper functions
const { supabase, supabaseAdmin } = require('./supabaseClient');

const SubscriptionModel = {
  /**
   * Create a new subscription
   * @param {Object} subscriptionData Subscription data
   * @returns {Promise<Object>} Created subscription
   */
  async create(subscriptionData) {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([{
        user_id: subscriptionData.userId,
        plan_id: subscriptionData.planId,
        plan_name: subscriptionData.planName,
        status: subscriptionData.status || 'active',
        traffic_limit: subscriptionData.trafficLimit,
        used_traffic: subscriptionData.usedTraffic || 0,
        start_date: subscriptionData.startDate,
        end_date: subscriptionData.endDate,
        auto_renew: subscriptionData.autoRenew || false,
        payment_id: subscriptionData.paymentId,
        last_checked_traffic: subscriptionData.lastCheckedTraffic,
        notes: subscriptionData.notes
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  /**
   * Get subscription by ID
   * @param {string} id Subscription ID
   * @returns {Promise<Object>} Subscription object
   */
  async getById(id) {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Add virtual properties
    if (data) {
      data.remainingTraffic = Math.max(0, data.traffic_limit - data.used_traffic);
      data.remainingDays = calculateRemainingDays(data.end_date);
      data.isActive = isSubscriptionActive(data);
    }
    
    return data;
  },
  
  /**
   * Get active subscriptions for a user
   * @param {string} userId User ID
   * @returns {Promise<Array>} Array of subscription objects
   */
  async getActiveByUserId(userId) {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Add virtual properties to each subscription
    if (data) {
      data.forEach(subscription => {
        subscription.remainingTraffic = Math.max(0, subscription.traffic_limit - subscription.used_traffic);
        subscription.remainingDays = calculateRemainingDays(subscription.end_date);
        subscription.isActive = isSubscriptionActive(subscription);
      });
    }
    
    return data;
  },
  
  /**
   * Update used traffic for a subscription
   * @param {string} id Subscription ID
   * @param {number} usedTraffic New used traffic value in GB
   * @returns {Promise<Object>} Updated subscription
   */
  async updateUsedTraffic(id, usedTraffic) {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        used_traffic: usedTraffic,
        last_checked_traffic: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  /**
   * Update subscription status
   * @param {string} id Subscription ID
   * @param {string} status New status ('active', 'expired', 'canceled', 'suspended')
   * @returns {Promise<Object>} Updated subscription
   */
  async updateStatus(id, status) {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    if (!['active', 'expired', 'canceled', 'suspended'].includes(status)) {
      throw new Error('Invalid subscription status');
    }
    
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  /**
   * Check for subscriptions that need to be expired
   * @returns {Promise<number>} Number of subscriptions updated
   */
  async expireOldSubscriptions() {
    if (!supabaseAdmin) throw new Error('Supabase admin client not initialized');
    
    const now = new Date().toISOString();
    
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'expired',
        updated_at: now
      })
      .eq('status', 'active')
      .lt('end_date', now);
    
    if (error) throw error;
    return data ? data.length : 0;
  }
};

// Helper function to calculate remaining days
function calculateRemainingDays(endDate) {
  const now = new Date();
  const end = new Date(endDate);
  
  // Calculate difference in days
  const diff = end - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  return Math.max(0, days);
}

// Helper function to check if subscription is active
function isSubscriptionActive(subscription) {
  const now = new Date();
  return (
    subscription.status === 'active' &&
    new Date(subscription.end_date) > now &&
    (subscription.used_traffic < subscription.traffic_limit || subscription.traffic_limit === 0)
  );
}

module.exports = SubscriptionModel; 