// Common types used across the application

// Subscription Plans
export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  features: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

// User Subscriptions
export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  start_date: string;
  end_date: string;
  payment_id?: string;
  created_at: string;
  updated_at: string;
}

export type SubscriptionStatus = 'active' | 'expired' | 'canceled' | 'pending';

// User Profile
export interface User {
  id: string;
  email: string;
  full_name?: string;
  telegram_id?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'user';

// Payments
export interface Payment {
  id: string;
  user_id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string;
  provider_payment_id?: string;
  created_at: string;
  updated_at: string;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

// VPN-specific types
export interface VPNAccount {
  id: string;
  user_id: string;
  subscription_id: string;
  username: string;
  password: string;
  status: VPNAccountStatus;
  server_id?: string;
  ip_address?: string;
  expiration_date: string;
  traffic_used?: number; // in bytes
  traffic_limit?: number; // in bytes
  created_at: string;
  updated_at: string;
}

export type VPNAccountStatus = 'active' | 'disabled' | 'expired';

export interface VPNServer {
  id: string;
  name: string;
  location: string;
  country_code: string;
  ip_address: string;
  status: VPNServerStatus;
  protocol: VPNProtocol;
  port: number;
  created_at: string;
  updated_at: string;
}

export type VPNServerStatus = 'online' | 'offline' | 'maintenance';
export type VPNProtocol = 'wireguard' | 'openvpn' | 'ipsec' | 'trojan';

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// Environment configuration
export interface EnvConfig {
  nodeEnv: string;
  port: number;
  supabaseUrl: string;
  supabaseKey: string;
  supabaseServiceRoleKey?: string;
  telegramBotToken?: string;
  jwtSecret: string;
  jwtExpiresIn: string;
}

// Error types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

// Auth types
export interface AuthRequest extends Request {
  user?: User;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// Telegram Bot types
export interface TelegramUser {
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  user_id?: string;
  registered_at: string;
  last_interaction?: string;
}

export interface TelegramCommand {
  command: string;
  description: string;
  handler: Function;
  adminOnly?: boolean;
} 