-- Create leads table for lead generation
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  company_name TEXT,
  role TEXT NOT NULL,
  interests TEXT[],
  company_size TEXT,
  automation_challenge TEXT,
  ip_address INET,
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT UNIQUE,
  verification_sent_at TIMESTAMPTZ,
  download_count INTEGER DEFAULT 0,
  download_limit INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can insert leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all leads"
  ON public.leads FOR SELECT
  USING (is_site_admin());

CREATE POLICY "Admins can update leads"
  ON public.leads FOR UPDATE
  USING (is_site_admin());

-- Index for performance
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_ip ON public.leads(ip_address);
CREATE INDEX idx_leads_verification_token ON public.leads(verification_token);

-- Trigger to update updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add lead_email column to workflow_downloads
ALTER TABLE public.workflow_downloads 
  ADD COLUMN lead_email TEXT,
  ADD CONSTRAINT fk_lead_email FOREIGN KEY (lead_email) 
    REFERENCES public.leads(email) ON DELETE SET NULL;

CREATE INDEX idx_workflow_downloads_lead_email ON public.workflow_downloads(lead_email);

-- Create helper function for download eligibility
CREATE OR REPLACE FUNCTION public.check_download_eligibility(
  p_email TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL
)
RETURNS TABLE (
  can_download BOOLEAN,
  downloads_used INTEGER,
  downloads_remaining INTEGER,
  requires_verification BOOLEAN,
  message TEXT
) AS $$
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
    RETURN QUERY SELECT TRUE, 0, 10, FALSE, 'Welcome! Your first download is free.'::TEXT;
    RETURN;
  END IF;
  
  -- Count their downloads
  v_download_count := v_lead.download_count;
  
  -- Check if email is verified (required after first download)
  IF v_download_count > 0 AND NOT v_lead.email_verified THEN
    RETURN QUERY SELECT FALSE, v_download_count, (v_lead.download_limit - v_download_count), TRUE, 
      'Please verify your email to continue downloading.'::TEXT;
    RETURN;
  END IF;
  
  -- Check if limit reached
  IF v_download_count >= v_lead.download_limit THEN
    RETURN QUERY SELECT FALSE, v_download_count, 0, FALSE, 
      'You have reached your download limit. Book a call to get more!'::TEXT;
    RETURN;
  END IF;
  
  -- All good!
  RETURN QUERY SELECT TRUE, v_download_count, (v_lead.download_limit - v_download_count), FALSE, 
    'You can download this workflow.'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;