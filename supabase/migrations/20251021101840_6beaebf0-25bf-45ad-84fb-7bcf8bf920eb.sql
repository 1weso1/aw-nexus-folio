-- Create enum for payment types
CREATE TYPE public.payment_type AS ENUM ('one_time', 'monthly');

-- Create enum for payment link status
CREATE TYPE public.payment_link_status AS ENUM ('active', 'expired', 'completed', 'cancelled');

-- Create enum for transaction status
CREATE TYPE public.transaction_status AS ENUM ('pending', 'success', 'failed', 'refunded');

-- Create enum for subscription status
CREATE TYPE public.subscription_status AS ENUM ('active', 'paused', 'cancelled', 'payment_failed');

-- Create payment_links table
CREATE TABLE public.payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  link_slug TEXT NOT NULL UNIQUE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'EGP',
  payment_type public.payment_type NOT NULL DEFAULT 'one_time',
  description TEXT NOT NULL,
  status public.payment_link_status NOT NULL DEFAULT 'active',
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment_transactions table
CREATE TABLE public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_link_id UUID REFERENCES public.payment_links(id) ON DELETE CASCADE NOT NULL,
  paymob_order_id TEXT,
  paymob_transaction_id TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL,
  amount_in_egp DECIMAL(10, 2),
  status public.transaction_status NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_name TEXT NOT NULL,
  paymob_response JSONB,
  error_message TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recurring_subscriptions table
CREATE TABLE public.recurring_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_link_id UUID REFERENCES public.payment_links(id) ON DELETE CASCADE NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_name TEXT NOT NULL,
  status public.subscription_status NOT NULL DEFAULT 'active',
  next_payment_date DATE,
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_payment_transaction_id UUID REFERENCES public.payment_transactions(id),
  total_payments_made INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exchange_rates table for multi-currency support
CREATE TABLE public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL DEFAULT 'EGP',
  rate DECIMAL(10, 4) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(from_currency, to_currency)
);

-- Insert default exchange rates
INSERT INTO public.exchange_rates (from_currency, to_currency, rate) VALUES
  ('EGP', 'EGP', 1),
  ('USD', 'EGP', 50),
  ('EUR', 'EGP', 55),
  ('SAR', 'EGP', 13.5),
  ('AED', 'EGP', 13.8);

-- Create updated_at trigger function (reuse existing if available)
CREATE OR REPLACE FUNCTION public.update_payment_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_payment_links_updated_at
  BEFORE UPDATE ON public.payment_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payment_updated_at();

CREATE TRIGGER update_recurring_subscriptions_updated_at
  BEFORE UPDATE ON public.recurring_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payment_updated_at();

-- Enable RLS on all tables
ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_links
CREATE POLICY "Admins can manage payment links"
  ON public.payment_links
  FOR ALL
  USING (public.is_site_admin());

CREATE POLICY "Public can view active payment links by slug"
  ON public.payment_links
  FOR SELECT
  USING (status = 'active' AND (expires_at IS NULL OR expires_at > now()));

-- RLS Policies for payment_transactions
CREATE POLICY "Admins can view all transactions"
  ON public.payment_transactions
  FOR SELECT
  USING (public.is_site_admin());

CREATE POLICY "System can insert transactions"
  ON public.payment_transactions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update transactions"
  ON public.payment_transactions
  FOR UPDATE
  USING (true);

-- RLS Policies for recurring_subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON public.recurring_subscriptions
  FOR SELECT
  USING (public.is_site_admin());

CREATE POLICY "Admins can update subscriptions"
  ON public.recurring_subscriptions
  FOR UPDATE
  USING (public.is_site_admin());

CREATE POLICY "System can manage subscriptions"
  ON public.recurring_subscriptions
  FOR ALL
  USING (true);

-- RLS Policies for exchange_rates
CREATE POLICY "Everyone can read exchange rates"
  ON public.exchange_rates
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage exchange rates"
  ON public.exchange_rates
  FOR ALL
  USING (public.is_site_admin());

-- Create indexes for better performance
CREATE INDEX idx_payment_links_slug ON public.payment_links(link_slug);
CREATE INDEX idx_payment_links_status ON public.payment_links(status);
CREATE INDEX idx_payment_links_admin_user ON public.payment_links(admin_user_id);

CREATE INDEX idx_payment_transactions_link_id ON public.payment_transactions(payment_link_id);
CREATE INDEX idx_payment_transactions_paymob_order ON public.payment_transactions(paymob_order_id);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX idx_payment_transactions_customer_email ON public.payment_transactions(customer_email);

CREATE INDEX idx_recurring_subscriptions_link_id ON public.recurring_subscriptions(payment_link_id);
CREATE INDEX idx_recurring_subscriptions_status ON public.recurring_subscriptions(status);
CREATE INDEX idx_recurring_subscriptions_next_payment ON public.recurring_subscriptions(next_payment_date);
CREATE INDEX idx_recurring_subscriptions_customer_email ON public.recurring_subscriptions(customer_email);