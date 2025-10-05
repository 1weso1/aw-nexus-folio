-- Add explicit deny policy for public read access to subscribers table
CREATE POLICY "Explicitly deny anonymous read of subscribers"
ON public.subscribers
FOR SELECT
TO anon
USING (false);