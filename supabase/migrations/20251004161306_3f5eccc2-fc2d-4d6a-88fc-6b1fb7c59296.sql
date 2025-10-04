-- Fix the notification functions to use proper authorization
CREATE OR REPLACE FUNCTION public.notify_booking_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_id bigint;
BEGIN
  -- Call the edge function using pg_net (no auth needed since verify_jwt is false)
  SELECT extensions.http_post(
    'https://ugjeubqwmgnqvohmrkyv.supabase.co/functions/v1/send-booking-notification',
    jsonb_build_object(
      'name', NEW.name,
      'email', NEW.email,
      'phone', NEW.phone,
      'window_text', NEW.window_text,
      'notes', NEW.notes,
      'created_at', NEW.created_at
    ),
    jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnamV1YnF3bWducXZvaG1ya3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0Nzc5NDEsImV4cCI6MjA3MjA1Mzk0MX0.esXYyxM-eQbKBXhG2NKrzLsdiveNo4lBsK_rlv_ebjo'
    )
  ) INTO request_id;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_contact_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_id bigint;
BEGIN
  -- Call the edge function using pg_net (no auth needed since verify_jwt is false)
  SELECT extensions.http_post(
    'https://ugjeubqwmgnqvohmrkyv.supabase.co/functions/v1/send-contact-notification',
    jsonb_build_object(
      'name', NEW.name,
      'email', NEW.email,
      'subject', NEW.subject,
      'message', NEW.message,
      'created_at', NEW.created_at
    ),
    jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnamV1YnF3bWducXZvaG1ya3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0Nzc5NDEsImV4cCI6MjA3MjA1Mzk0MX0.esXYyxM-eQbKBXhG2NKrzLsdiveNo4lBsK_rlv_ebjo'
    )
  ) INTO request_id;

  RETURN NEW;
END;
$$;