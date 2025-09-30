-- Verify contact_messages security and add explicit public read denial

-- First, let's ensure RLS is enabled (should already be)
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop any existing public read policies (if they exist)
DROP POLICY IF EXISTS "public_read_contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Public users cannot read contact messages" ON public.contact_messages;

-- Add an explicit denial policy for public/non-admin reads
-- This ensures that even if someone tries to read, they're explicitly denied
CREATE POLICY "Deny public read of contact messages"
ON public.contact_messages
FOR SELECT
TO public
USING (false);

-- Ensure the admin policy exists and takes precedence
-- (This should already exist, but let's make sure)
DROP POLICY IF EXISTS "Site admin can view contact messages" ON public.contact_messages;

CREATE POLICY "Site admin can view contact messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (is_site_admin());

-- Verify the INSERT policy (should allow public submissions)
-- This is necessary for the contact form to work
DROP POLICY IF EXISTS "Allow public to create contact messages" ON public.contact_messages;

CREATE POLICY "Allow public to create contact messages"
ON public.contact_messages
FOR INSERT
TO public
WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE public.contact_messages IS 'Stores contact form submissions. RLS enforced: Public can INSERT only, SELECT restricted to site admin only.';