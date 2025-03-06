const { createClient } = require('@supabase/supabase-js');

/**
 * Payment model compatible with Supabase
 * Provides similar interface to the previous mongoose model
 */
class Payment {
  constructor(data) {
    Object.assign(this, data);
  }

  static async create(paymentData) {
    const supabase = global.supabase;
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('payments')
      .insert(paymentData)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return new Payment(data);
  }

  static async findById(id) {
    const supabase = global.supabase;
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data ? new Payment(data) : null;
  }

  static async find(query = {}) {
    const supabase = global.supabase;
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    let queryBuilder = supabase.from('payments').select('*');
    
    // Apply filters from query
    Object.entries(query).forEach(([key, value]) => {
      queryBuilder = queryBuilder.eq(key, value);
    });

    const { data, error } = await queryBuilder;

    if (error) {
      throw error;
    }

    return data.map(payment => new Payment(payment));
  }
}

module.exports = Payment; 