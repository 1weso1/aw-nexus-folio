-- Create function to send contact notification via edge function
CREATE OR REPLACE FUNCTION public.notify_contact_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  -- Call the edge function using pg_net
  SELECT net.http_post(
    url := 'https://ugjeubqwmgnqvohmrkyv.supabase.co/functions/v1/send-contact-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := payload
  ) INTO request_id;

  RETURN NEW;
END;
$$;

-- Create trigger for contact messages
DROP TRIGGER IF EXISTS on_contact_message_created ON public.contact_messages;
CREATE TRIGGER on_contact_message_created
  AFTER INSERT ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_contact_submission();

-- Create function to send booking notification via edge function
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
  -- Build the payload
  payload := jsonb_build_object(
    'name', NEW.name,
    'email', NEW.email,
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

-- Create trigger for booking requests
DROP TRIGGER IF EXISTS on_booking_request_created ON public.booking_requests;
CREATE TRIGGER on_booking_request_created
  AFTER INSERT ON public.booking_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_booking_submission();