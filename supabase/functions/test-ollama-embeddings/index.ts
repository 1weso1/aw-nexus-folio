import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { testText = "Hello world" } = await req.json();
    
    const OLLAMA_API_KEY = Deno.env.get('OLLAMA_API_KEY');
    const OLLAMA_CLOUD_ENDPOINT = Deno.env.get('OLLAMA_CLOUD_ENDPOINT');

    console.log('Environment check:', {
      hasApiKey: !!OLLAMA_API_KEY,
      apiKeyPrefix: OLLAMA_API_KEY?.substring(0, 10) + '...',
      endpoint: OLLAMA_CLOUD_ENDPOINT
    });

    if (!OLLAMA_API_KEY) {
      throw new Error('OLLAMA_API_KEY is not set');
    }

    if (!OLLAMA_CLOUD_ENDPOINT) {
      throw new Error('OLLAMA_CLOUD_ENDPOINT is not set');
    }

    const url = `${OLLAMA_CLOUD_ENDPOINT}/api/embed`;
    console.log('Calling Ollama API:', url);

    const embeddingResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OLLAMA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mxbai-embed-large',
        input: testText
      }),
    });

    console.log('Response status:', embeddingResponse.status);
    
    const responseText = await embeddingResponse.text();
    console.log('Response body:', responseText.substring(0, 200));

    if (!embeddingResponse.ok) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'API call failed',
        status: embeddingResponse.status,
        response: responseText,
        requestDetails: {
          url,
          hasAuth: !!OLLAMA_API_KEY,
          endpoint: OLLAMA_CLOUD_ENDPOINT
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const embeddingData = JSON.parse(responseText);
    const embedding = embeddingData.embeddings?.[0];

    return new Response(JSON.stringify({
      success: true,
      hasEmbedding: !!embedding,
      embeddingLength: embedding?.length || 0,
      response: embeddingData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
