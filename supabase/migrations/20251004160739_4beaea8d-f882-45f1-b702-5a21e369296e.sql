-- Create trigger on booking_requests table to send notifications
DROP TRIGGER IF EXISTS on_booking_request_created ON public.booking_requests;

CREATE TRIGGER on_booking_request_created
  AFTER INSERT ON public.booking_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_booking_submission();

-- Also recreate the contact trigger to ensure it works
DROP TRIGGER IF EXISTS on_contact_message_created ON public.contact_messages;

CREATE TRIGGER on_contact_message_created
  AFTER INSERT ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_contact_submission();