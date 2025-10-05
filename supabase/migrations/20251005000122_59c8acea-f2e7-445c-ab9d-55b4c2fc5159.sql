-- Fix critical security vulnerability in leads table
-- Drop the overly permissive policy that allows public read access
DROP POLICY IF EXISTS "Users can read their own lead by email" ON public.leads;

-- Create a new, properly restricted policy for authenticated users
CREATE POLICY "Authenticated users can read their own lead by email"
ON public.leads
FOR SELECT
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR is_site_admin()
);

-- Ensure booking_requests has explicit deny for public SELECT
-- (redundant with existing policies but makes intent crystal clear)
DROP POLICY IF EXISTS "Deny public read of booking requests" ON public.booking_requests;

CREATE POLICY "Explicitly deny anonymous read of booking requests"
ON public.booking_requests
FOR SELECT
TO anon
USING (false);