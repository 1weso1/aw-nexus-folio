-- Create a function to check if the current user is the site admin
CREATE OR REPLACE FUNCTION public.is_site_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Replace 'contact@ahmedwesam.com' with your actual admin email
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'contact@ahmedwesam.com'
  );
$$;

-- Add SELECT policy for booking_requests that only allows the site admin to view them
CREATE POLICY "Site admin can view booking requests"
ON public.booking_requests
FOR SELECT
TO authenticated
USING (public.is_site_admin());

-- Also add similar policies for contact_messages for consistency
CREATE POLICY "Site admin can view contact messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (public.is_site_admin());

-- And for subscribers table
CREATE POLICY "Site admin can view subscribers"
ON public.subscribers
FOR SELECT
TO authenticated
USING (public.is_site_admin());