-- Fix overly permissive UPDATE policies on leads table

-- Drop the insecure policies
DROP POLICY IF EXISTS "Allow incrementing download count" ON public.leads;
DROP POLICY IF EXISTS "Users can verify their own email with valid token" ON public.leads;

-- For now, remove UPDATE capability for anonymous users entirely
-- We'll use edge functions for secure updates instead

-- Keep the admin policy (already exists)
-- This ensures only admins can update leads directly