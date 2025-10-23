import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, limit = 20 } = await req.json();

    if (!query || query.trim() === '') {
      throw new Error('Search query is required');
    }

    const OLLAMA_API_KEY = Deno.env.get('OLLAMA_API_KEY');
    const OLLAMA_CLOUD_ENDPOINT = Deno.env.get('OLLAMA_CLOUD_ENDPOINT');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!OLLAMA_API_KEY || !OLLAMA_CLOUD_ENDPOINT || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log('Generating embedding for query:', query);

    // Generate embedding for the search query using Ollama Cloud with Deepseek model
    const embeddingResponse = await fetch(
      `${OLLAMA_CLOUD_ENDPOINT}/api/embed`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OLLAMA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-v3.1:671b-cloud',
          input: query
        }),
      }
    );

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      console.error('Embedding API error:', embeddingResponse.status, errorText);
      throw new Error(`Embedding generation failed: ${errorText}`);
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.embeddings?.[0];

    if (!queryEmbedding) {
      throw new Error('No embedding returned for query');
    }

    console.log('Performing vector similarity search with Deepseek embeddings...');

    // Perform cosine similarity search using pgvector with Deepseek embeddings
    // Note: Using RPC call to perform vector similarity search
    const { data: results, error: searchError } = await supabase.rpc(
      'match_workflows_deepseek',
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.3,
        match_count: limit
      }
    );

    if (searchError) {
      // If RPC function doesn't exist, fall back to manual query
      console.log('RPC function not found, using manual query');
      
      const { data: workflows, error: manualError } = await supabase
        .from('workflow_vectors')
        .select('workflow_id, description_text, embedding_deepseek')
        .not('embedding_deepseek', 'is', null)
        .limit(1000);

      if (manualError) {
        throw manualError;
      }

      // Calculate cosine similarity manually
      const workflowScores = workflows.map(wf => {
        const similarity = cosineSimilarity(queryEmbedding, wf.embedding_deepseek);
        return {
          workflow_id: wf.workflow_id,
          similarity,
          description_text: wf.description_text,
        };
      });

      // Sort by similarity and take top results
      const topResults = workflowScores
        .filter(w => w.similarity >= 0.3)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      return new Response(JSON.stringify({
        success: true,
        results: topResults,
        count: topResults.length,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${results?.length || 0} matching workflows`);

    return new Response(JSON.stringify({
      success: true,
      results: results || [],
      count: results?.length || 0,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in semantic-search function:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ 
      error: errorMsg,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Cosine similarity calculation for fallback
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
