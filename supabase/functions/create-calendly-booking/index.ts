import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingRequest {
  event_type_uri: string;
  start_time: string;
  invitee_name: string;
  invitee_email: string;
  invitee_phone?: string;
  notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CALENDLY_API_KEY = Deno.env.get("CALENDLY_API_KEY");
    if (!CALENDLY_API_KEY) {
      throw new Error("CALENDLY_API_KEY is not configured");
    }

    const { event_type_uri, start_time, invitee_name, invitee_email, invitee_phone, notes }: BookingRequest = await req.json();

    console.log("Creating Calendly booking for:", invitee_email, "at", start_time);

    const calendlyHeaders = {
      "Authorization": `Bearer ${CALENDLY_API_KEY}`,
      "Content-Type": "application/json",
    };

    // Create the booking payload for Calendly API v2
    const bookingPayload = {
      event_type: event_type_uri,
      start_time: start_time,
      invitee: {
        name: invitee_name,
        email: invitee_email,
        ...(invitee_phone && { phone_number: invitee_phone }),
      },
      ...(notes && { questions_and_answers: [{ question: "What would you like to discuss?", answer: notes }] }),
    };

    // Create the scheduled event using Calendly API
    const bookingResponse = await fetch("https://api.calendly.com/scheduled_events", {
      method: "POST",
      headers: calendlyHeaders,
      body: JSON.stringify(bookingPayload),
    });

    if (!bookingResponse.ok) {
      const errorText = await bookingResponse.text();
      console.error("Calendly booking error:", errorText);
      throw new Error(`Failed to create Calendly booking: ${bookingResponse.statusText} - ${errorText}`);
    }

    const bookingData = await bookingResponse.json();
    console.log("Successfully created Calendly booking:", bookingData.resource?.uri);

    return new Response(
      JSON.stringify({ 
        success: true, 
        booking: bookingData.resource,
        message: "Booking created successfully in Calendly"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in create-calendly-booking:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
