import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CalendlyAvailableTime {
  start_time: string;
  status: string;
}

interface GroupedSlots {
  [date: string]: string[];
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

    const calendlyHeaders = {
      "Authorization": `Bearer ${CALENDLY_API_KEY}`,
      "Content-Type": "application/json",
    };

    // Step 1: Get user info
    const userResponse = await fetch("https://api.calendly.com/users/me", {
      headers: calendlyHeaders,
    });

    if (!userResponse.ok) {
      throw new Error(`Failed to fetch user: ${userResponse.statusText}`);
    }

    const userData = await userResponse.json();
    const userUri = userData.resource.uri;

    // Step 2: Get event types
    const eventTypesResponse = await fetch(
      `https://api.calendly.com/event_types?user=${userUri}&active=true`,
      { headers: calendlyHeaders }
    );

    if (!eventTypesResponse.ok) {
      throw new Error(`Failed to fetch event types: ${eventTypesResponse.statusText}`);
    }

    const eventTypesData = await eventTypesResponse.json();
    
    if (!eventTypesData.collection || eventTypesData.collection.length === 0) {
      console.log("No active event types found");
      return new Response(
        JSON.stringify({ slots: {}, message: "No event types available" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Use the first active event type
    const eventType = eventTypesData.collection[0];
    const eventTypeUri = eventType.uri;

    // Step 3: Get available times for next 7 days (Calendly's max)
    const startDate = new Date();
    // Add 1 hour buffer to ensure start_time is in the future
    startDate.setHours(startDate.getHours() + 1);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    const startTime = startDate.toISOString();
    const endTime = endDate.toISOString();

    const availabilityUrl = `https://api.calendly.com/event_type_available_times?event_type=${encodeURIComponent(eventTypeUri)}&start_time=${startTime}&end_time=${endTime}`;
    
    const availabilityResponse = await fetch(availabilityUrl, {
      headers: calendlyHeaders,
    });

    if (!availabilityResponse.ok) {
      console.error("Availability response error:", await availabilityResponse.text());
      throw new Error(`Failed to fetch availability: ${availabilityResponse.statusText}`);
    }

    const availabilityData = await availabilityResponse.json();
    
    // Group slots by date
    const groupedSlots: GroupedSlots = {};
    
    if (availabilityData.collection && Array.isArray(availabilityData.collection)) {
      availabilityData.collection.forEach((slot: CalendlyAvailableTime) => {
        if (slot.status === "available") {
          const dateTime = new Date(slot.start_time);
          const dateKey = dateTime.toISOString().split('T')[0]; // YYYY-MM-DD
          const timeString = dateTime.toISOString(); // Full ISO string for frontend
          
          if (!groupedSlots[dateKey]) {
            groupedSlots[dateKey] = [];
          }
          groupedSlots[dateKey].push(timeString);
        }
      });
    }

    console.log("Successfully fetched availability:", Object.keys(groupedSlots).length, "days");

    return new Response(
      JSON.stringify({ 
        slots: groupedSlots,
        eventType: {
          name: eventType.name,
          duration: eventType.duration,
          uri: eventTypeUri
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in get-calendly-availability:", error);
    return new Response(
      JSON.stringify({ error: error.message, slots: {} }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
