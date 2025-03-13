import { z } from 'zod';

/**
 * User schemas for validation
 */
export const userSchemas = {
  // Schema for user creation/registration
  create: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      name: z.string().min(2, 'Name must be at least 2 characters').optional(),
      role: z.enum(['user', 'admin']).optional(),
    }),
  }),

  // Schema for user login
  login: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(1, 'Password is required'),
    }),
  }),

  // Schema for user update
  update: z.object({
    params: z.object({
      id: z.string().uuid('Invalid user ID format'),
    }),
    body: z.object({
      email: z.string().email('Invalid email format').optional(),
      name: z.string().min(2, 'Name must be at least 2 characters').optional(),
      role: z.enum(['user', 'admin']).optional(),
    }),
  }),
};

/**
 * Subscription schemas for validation
 */
export const subscriptionSchemas = {
  // Schema for creating a subscription
  create: z.object({
    body: z.object({
      userId: z.string().uuid('Invalid user ID format'),
      planId: z.string().uuid('Invalid plan ID format'),
      startDate: z.string().datetime({ offset: true }).optional(),
      endDate: z.string().datetime({ offset: true }).optional(),
      status: z.enum(['active', 'pending', 'expired', 'cancelled']).optional(),
      autoRenew: z.boolean().optional(),
    }),
  }),

  // Schema for updating a subscription
  update: z.object({
    params: z.object({
      id: z.string().uuid('Invalid subscription ID format'),
    }),
    body: z.object({
      planId: z.string().uuid('Invalid plan ID format').optional(),
      endDate: z.string().datetime({ offset: true }).optional(),
      status: z.enum(['active', 'pending', 'expired', 'cancelled']).optional(),
      autoRenew: z.boolean().optional(),
    }),
  }),
};

/**
 * VPN Plan schemas for validation
 */
export const planSchemas = {
  // Schema for creating a plan
  create: z.object({
    body: z.object({
      name: z.string().min(2, 'Plan name must be at least 2 characters'),
      description: z.string().optional(),
      price: z.number().positive('Price must be positive'),
      duration: z.number().int().positive('Duration must be a positive integer'),
      durationUnit: z.enum(['day', 'week', 'month', 'year']),
      features: z.array(z.string()).optional(),
      dataLimit: z.number().int().positive('Data limit must be a positive integer').optional(),
      isActive: z.boolean().optional(),
    }),
  }),

  // Schema for updating a plan
  update: z.object({
    params: z.object({
      id: z.string().uuid('Invalid plan ID format'),
    }),
    body: z.object({
      name: z.string().min(2, 'Plan name must be at least 2 characters').optional(),
      description: z.string().optional(),
      price: z.number().positive('Price must be positive').optional(),
      duration: z.number().int().positive('Duration must be a positive integer').optional(),
      durationUnit: z.enum(['day', 'week', 'month', 'year']).optional(),
      features: z.array(z.string()).optional(),
      dataLimit: z.number().int().positive('Data limit must be a positive integer').optional(),
      isActive: z.boolean().optional(),
    }),
  }),
}; 