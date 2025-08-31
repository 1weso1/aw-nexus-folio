-- Create tables for booking requests, newsletter subscribers, and contact messages
-- These tables support the new native functionality for the site

-- Table for booking requests
CREATE TABLE public.booking_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  window_text TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for booking_requests
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

-- Create policy for booking_requests (public can insert only)
CREATE POLICY "Allow public to create booking requests" 
ON public.booking_requests 
FOR INSERT 
WITH CHECK (true);

-- Table for newsletter subscribers
CREATE TABLE public.subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for subscribers
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy for subscribers (public can insert/upsert only)
CREATE POLICY "Allow public to subscribe to newsletter" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (true);

-- Table for contact messages
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for contact_messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Create policy for contact_messages (public can insert only)
CREATE POLICY "Allow public to create contact messages" 
ON public.contact_messages 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_booking_requests_created_at ON public.booking_requests(created_at DESC);
CREATE INDEX idx_subscribers_email ON public.subscribers(email);
CREATE INDEX idx_subscribers_status ON public.subscribers(status);
CREATE INDEX idx_contact_messages_created_at ON public.contact_messages(created_at DESC);