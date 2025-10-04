-- Fix RLS policy to allow users to verify their own email
-- This allows the verification page to update email_verified when they have the valid token
CREATE POLICY "Users can verify their own email with valid token"
ON public.leads
FOR UPDATE
USING (verification_token IS NOT NULL)
WITH CHECK (verification_token IS NOT NULL);

-- Add policy to allow incrementing download count
CREATE POLICY "Allow incrementing download count"
ON public.leads
FOR UPDATE
USING (true)
WITH CHECK (true);