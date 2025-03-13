import { createClient } from '@supabase/supabase-js';
import { Plan, Subscription, SubscriptionStatus, VPNAccount } from '../types';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get all available plans
 */
export const getAllPlans = async (): Promise<Plan[]> => {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('active', true)
      .order('price', { ascending: true });

    if (error) throw new Error(error.message);

    return data as Plan[];
  } catch (error) {
    console.error('Error getting plans:', error);
    return [];
  }
};

/**
 * Get plan by ID
 * @param id Plan ID
 */
export const getPlanById = async (id: string): Promise<Plan | null> => {
  try {
    const { data, error } = await supabase.from('plans').select('*').eq('id', id).single();

    if (error) throw new Error(error.message);

    return data as Plan;
  } catch (error) {
    console.error('Error getting plan by ID:', error);
    return null;
  }
};

/**
 * Get user subscriptions
 * @param userId User ID
 */
export const getUserSubscriptions = async (userId: string): Promise<Subscription[]> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, plans(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return data as Subscription[];
  } catch (error) {
    console.error('Error getting user subscriptions:', error);
    return [];
  }
};

/**
 * Get subscription by ID
 * @param id Subscription ID
 */
export const getSubscriptionById = async (id: string): Promise<Subscription | null> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, plans(*)')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);

    return data as Subscription;
  } catch (error) {
    console.error('Error getting subscription by ID:', error);
    return null;
  }
};

/**
 * Create new subscription
 * @param userId User ID
 * @param planId Plan ID
 * @param paymentId Payment ID (optional)
 */
export const createSubscription = async (
  userId: string,
  planId: string,
  paymentId?: string
): Promise<Subscription | null> => {
  try {
    // Get plan details to calculate end date
    const plan = await getPlanById(planId);
    if (!plan) throw new Error('Plan not found');

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration_days);

    // Create subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: userId,
          plan_id: planId,
          status: 'active' as SubscriptionStatus,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          payment_id: paymentId,
        },
      ])
      .select()
      .single();

    if (error) throw new Error(error.message);

    return data as Subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    return null;
  }
};

/**
 * Update subscription status
 * @param id Subscription ID
 * @param status New status
 */
export const updateSubscriptionStatus = async (
  id: string,
  status: SubscriptionStatus
): Promise<Subscription | null> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return data as Subscription;
  } catch (error) {
    console.error('Error updating subscription status:', error);
    return null;
  }
};

/**
 * Renew subscription
 * @param id Subscription ID
 * @param paymentId Payment ID (optional)
 */
export const renewSubscription = async (
  id: string,
  paymentId?: string
): Promise<Subscription | null> => {
  try {
    // Get current subscription
    const subscription = await getSubscriptionById(id);
    if (!subscription) throw new Error('Subscription not found');

    // Get plan details
    const plan = await getPlanById(subscription.plan_id);
    if (!plan) throw new Error('Plan not found');

    // Calculate new end date
    const currentEndDate = new Date(subscription.end_date);
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(newEndDate.getDate() + plan.duration_days);

    // Update subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active' as SubscriptionStatus,
        end_date: newEndDate.toISOString(),
        payment_id: paymentId || subscription.payment_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return data as Subscription;
  } catch (error) {
    console.error('Error renewing subscription:', error);
    return null;
  }
};

/**
 * Check if a subscription is active
 * @param id Subscription ID
 */
export const isSubscriptionActive = async (id: string): Promise<boolean> => {
  try {
    const subscription = await getSubscriptionById(id);
    if (!subscription) return false;

    return (
      subscription.status === 'active' && new Date(subscription.end_date) > new Date()
    );
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
};

/**
 * Get VPN accounts for a subscription
 * @param subscriptionId Subscription ID
 */
export const getVPNAccounts = async (subscriptionId: string): Promise<VPNAccount[]> => {
  try {
    const { data, error } = await supabase
      .from('vpn_accounts')
      .select('*')
      .eq('subscription_id', subscriptionId);

    if (error) throw new Error(error.message);

    return data as VPNAccount[];
  } catch (error) {
    console.error('Error getting VPN accounts:', error);
    return [];
  }
}; 