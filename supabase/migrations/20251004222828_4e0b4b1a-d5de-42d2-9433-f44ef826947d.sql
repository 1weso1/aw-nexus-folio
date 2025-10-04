-- Add tier system to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS access_tier text DEFAULT 'free' CHECK (access_tier IN ('free', 'gold', 'platinum')),
ADD COLUMN IF NOT EXISTS can_access_expert boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS can_access_enterprise boolean DEFAULT false;

-- Create trigger function to set download limits based on tier
CREATE OR REPLACE FUNCTION public.set_download_limit_by_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set limits based on tier
  IF NEW.access_tier = 'free' THEN
    NEW.download_limit := 10;
    NEW.can_access_expert := false;
    NEW.can_access_enterprise := false;
  ELSIF NEW.access_tier = 'gold' THEN
    NEW.download_limit := 100;
    NEW.can_access_expert := true;
    NEW.can_access_enterprise := false;
  ELSIF NEW.access_tier = 'platinum' THEN
    NEW.download_limit := 9999;
    NEW.can_access_expert := true;
    NEW.can_access_enterprise := true;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on leads table
DROP TRIGGER IF EXISTS set_tier_limits ON public.leads;
CREATE TRIGGER set_tier_limits
  BEFORE INSERT OR UPDATE OF access_tier ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.set_download_limit_by_tier();

-- Update existing leads to have proper tier settings
UPDATE public.leads 
SET access_tier = 'free',
    can_access_expert = false,
    can_access_enterprise = false
WHERE access_tier IS NULL;

-- Drop and recreate check_download_eligibility function with new return columns
DROP FUNCTION IF EXISTS public.check_download_eligibility(text, inet);

CREATE FUNCTION public.check_download_eligibility(
  p_email text DEFAULT NULL,
  p_ip_address inet DEFAULT NULL
)
RETURNS TABLE(
  can_download boolean,
  downloads_used integer,
  downloads_remaining integer,
  requires_verification boolean,
  message text,
  access_tier text,
  can_access_expert boolean,
  can_access_enterprise boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_lead RECORD;
  v_download_count INTEGER;
BEGIN
  -- Try to find lead by email first, then by IP
  SELECT * INTO v_lead FROM public.leads 
  WHERE (p_email IS NOT NULL AND email = p_email)
     OR (p_email IS NULL AND ip_address = p_ip_address)
  LIMIT 1;
  
  -- New user (first download is free)
  IF v_lead.id IS NULL THEN
    RETURN QUERY SELECT 
      TRUE, 
      0, 
      10, 
      FALSE, 
      'Welcome! Your first download is free.'::TEXT,
      'free'::TEXT,
      FALSE,
      FALSE;
    RETURN;
  END IF;
  
  -- Count their downloads
  v_download_count := v_lead.download_count;
  
  -- Check if email is verified (required after first download)
  IF v_download_count > 0 AND NOT v_lead.email_verified THEN
    RETURN QUERY SELECT 
      FALSE, 
      v_download_count, 
      (v_lead.download_limit - v_download_count), 
      TRUE, 
      'Please verify your email to continue downloading.'::TEXT,
      COALESCE(v_lead.access_tier, 'free'::TEXT),
      COALESCE(v_lead.can_access_expert, FALSE),
      COALESCE(v_lead.can_access_enterprise, FALSE);
    RETURN;
  END IF;
  
  -- Check if limit reached
  IF v_download_count >= v_lead.download_limit THEN
    RETURN QUERY SELECT 
      FALSE, 
      v_download_count, 
      0, 
      FALSE, 
      'You have reached your download limit. Book a call to get more!'::TEXT,
      COALESCE(v_lead.access_tier, 'free'::TEXT),
      COALESCE(v_lead.can_access_expert, FALSE),
      COALESCE(v_lead.can_access_enterprise, FALSE);
    RETURN;
  END IF;
  
  -- All good!
  RETURN QUERY SELECT 
    TRUE, 
    v_download_count, 
    (v_lead.download_limit - v_download_count), 
    FALSE, 
    'You can download this workflow.'::TEXT,
    COALESCE(v_lead.access_tier, 'free'::TEXT),
    COALESCE(v_lead.can_access_expert, FALSE),
    COALESCE(v_lead.can_access_enterprise, FALSE);
END;
$$;