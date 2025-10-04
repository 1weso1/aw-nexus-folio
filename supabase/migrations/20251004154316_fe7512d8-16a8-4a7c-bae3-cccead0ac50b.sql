-- Add phone column to booking_requests table
ALTER TABLE public.booking_requests 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Update the booking notification trigger function to include phone in payload
CREATE OR REPLACE FUNCTION public.notify_booking_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_id bigint;
  payload jsonb;
BEGIN
  -- Build the payload with phone field
  payload := jsonb_build_object(
    'name', NEW.name,
    'email', NEW.email,
    'phone', NEW.phone,
    'window_text', NEW.window_text,
    'notes', NEW.notes,
    'created_at', NEW.created_at
  );

  -- Call the edge function using pg_net
  SELECT net.http_post(
    url := 'https://ugjeubqwmgnqvohmrkyv.supabase.co/functions/v1/send-booking-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := payload
  ) INTO request_id;

  RETURN NEW;
END;
$$;