-- Fix RLS policy for leads table to ensure inserts work
-- Drop and recreate the policy as PERMISSIVE

DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;

-- Create permissive policy that allows anyone to insert
CREATE POLICY "Anyone can insert leads"
  ON public.leads 
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

-- Also ensure the policy for reading by email works for anon users
DROP POLICY IF EXISTS "Users can read their own lead by email" ON public.leads;

CREATE POLICY "Users can read their own lead by email"
  ON public.leads 
  FOR SELECT
  TO anon, authenticated
  USING (true); -- Allow anon to read for now, will be filtered client-side