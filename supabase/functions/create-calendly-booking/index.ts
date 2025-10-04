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

    console.log("Creating Calendly scheduling link for:", invitee_email, "at", start_time);

    const calendlyHeaders = {
      "Authorization": `Bearer ${CALENDLY_API_KEY}`,
      "Content-Type": "application/json",
    };

    // Create a single-use scheduling link with pre-filled information
    const schedulingPayload = {
      max_event_count: 1,
      owner: event_type_uri,
      owner_type: "EventType",
    };

    // Create the scheduling link
    const schedulingResponse = await fetch("https://api.calendly.com/scheduling_links", {
      method: "POST",
      headers: calendlyHeaders,
      body: JSON.stringify(schedulingPayload),
    });

    if (!schedulingResponse.ok) {
      const errorText = await schedulingResponse.text();
      console.error("Calendly scheduling link error:", errorText);
      throw new Error(`Failed to create Calendly scheduling link: ${schedulingResponse.statusText} - ${errorText}`);
    }

    const schedulingData = await schedulingResponse.json();
    const bookingUrl = schedulingData.resource?.booking_url;
    
    if (!bookingUrl) {
      throw new Error("No booking URL returned from Calendly");
    }

    // Add pre-fill parameters to the URL
    const urlParams = new URLSearchParams({
      name: invitee_name,
      email: invitee_email,
      ...(invitee_phone && { a1: invitee_phone }),
      ...(notes && { a2: notes }),
    });

    const prefilledUrl = `${bookingUrl}?${urlParams.toString()}`;
    
    console.log("Successfully created Calendly scheduling link");

    return new Response(
      JSON.stringify({ 
        success: true, 
        booking_url: prefilledUrl,
        message: "Scheduling link created successfully"
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
