-- Enable the necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_id TEXT UNIQUE,
  username TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP WITH TIME ZONE,
  vpn_username TEXT,
  vpn_password TEXT
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  traffic_limit NUMERIC NOT NULL, -- in GB
  used_traffic NUMERIC DEFAULT 0, -- in GB
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  auto_renew BOOLEAN DEFAULT FALSE,
  payment_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_checked_traffic TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  payment_id TEXT NOT NULL UNIQUE,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'RUB',
  status TEXT NOT NULL DEFAULT 'pending',
  method TEXT DEFAULT 'other',
  plan_id TEXT NOT NULL,
  plan_name TEXT,
  payment_date TIMESTAMP WITH TIME ZONE,
  gateway_response JSONB,
  invoice_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create subscription plans table
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  duration INTEGER NOT NULL, -- in days
  traffic NUMERIC NOT NULL, -- in GB
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create VPN servers table
CREATE TABLE IF NOT EXISTS public.servers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  flag TEXT,
  address TEXT NOT NULL,
  port INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update users" ON public.users
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Create RLS policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Create RLS policies for payments
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" ON public.payments
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Create RLS policies for plans
CREATE POLICY "Anyone can view active plans" ON public.plans
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage plans" ON public.plans
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Create RLS policies for servers
CREATE POLICY "Anyone can view active servers" ON public.servers
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage servers" ON public.servers
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Insert initial data for plans
INSERT INTO public.plans (id, name, price, duration, traffic, description)
VALUES
  ('basic', 'Basic', 300, 30, 50, 'Basic VPN access with 50GB traffic'),
  ('standard', 'Standard', 600, 30, 150, 'Standard VPN access with 150GB traffic'),
  ('premium', 'Premium', 900, 30, 500, 'Premium VPN access with 500GB traffic')
ON CONFLICT (id) DO NOTHING;

-- Insert initial data for servers
INSERT INTO public.servers (id, name, country, flag, address, port)
VALUES
  ('server1', 'Moscow', 'RU', '🇷🇺', 'server1.yourvpn.com', 443),
  ('server2', 'Saint Petersburg', 'RU', '🇷🇺', 'server2.yourvpn.com', 443),
  ('server3', 'Frankfurt', 'DE', '🇩🇪', 'server3.yourvpn.com', 443)
ON CONFLICT (id) DO NOTHING; 