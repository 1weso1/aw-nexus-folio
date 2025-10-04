-- Enable pg_net extension for HTTP requests from database triggers
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA extensions TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA extensions TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Update the booking notification trigger to use the correct schema
CREATE OR REPLACE FUNCTION public.notify_booking_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
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

  -- Call the edge function using pg_net from extensions schema
  SELECT extensions.http_post(
    url := 'https://ugjeubqwmgnqvohmrkyv.supabase.co/functions/v1/send-booking-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := payload
  ) INTO request_id;

  RETURN NEW;
END;
$function$;

-- Also update contact notification trigger for consistency
CREATE OR REPLACE FUNCTION public.notify_contact_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  request_id bigint;
  payload jsonb;
BEGIN
  -- Build the payload
  payload := jsonb_build_object(
    'name', NEW.name,
    'email', NEW.email,
    'subject', NEW.subject,
    'message', NEW.message,
    'created_at', NEW.created_at
  );

  -- Call the edge function using pg_net from extensions schema
  SELECT extensions.http_post(
    url := 'https://ugjeubqwmgnqvohmrkyv.supabase.co/functions/v1/send-contact-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := payload
  ) INTO request_id;

  RETURN NEW;
END;
$function$;