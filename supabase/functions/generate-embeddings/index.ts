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
    const { offset = 0, limit = 50 } = await req.json();
    
    const OLLAMA_API_KEY = Deno.env.get('OLLAMA_API_KEY');
    const OLLAMA_CLOUD_ENDPOINT = Deno.env.get('OLLAMA_CLOUD_ENDPOINT');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!OLLAMA_API_KEY || !OLLAMA_CLOUD_ENDPOINT || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch workflows with descriptions using proper join
    const { data: workflowsRaw, error: fetchError } = await supabase
      .from('workflows')
      .select('id, name')
      .range(offset, offset + limit - 1);

    if (fetchError) {
      console.error('Error fetching workflows:', fetchError);
      throw fetchError;
    }

    if (!workflowsRaw || workflowsRaw.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        processed: 0, 
        message: 'No workflows to process' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch descriptions for these workflows
    const workflowIds = workflowsRaw.map(w => w.id);
    const { data: descriptions, error: descError } = await supabase
      .from('workflow_descriptions')
      .select('workflow_id, description, use_cases, setup_guide')
      .in('workflow_id', workflowIds);

    if (descError) {
      console.error('Error fetching descriptions:', descError);
      throw descError;
    }

    // Create a map of workflow_id to description
    const descriptionMap = new Map(
      (descriptions || []).map(d => [d.workflow_id, d])
    );

    // Check which workflows already have embeddings
    const { data: existingEmbeddings } = await supabase
      .from('workflow_vectors')
      .select('workflow_id')
      .in('workflow_id', workflowIds);

    const existingIds = new Set(existingEmbeddings?.map(e => e.workflow_id) || []);
    
    // Combine workflow data with descriptions and filter
    const workflows = workflowsRaw
      .map(w => ({
        id: w.id,
        name: w.name,
        description: descriptionMap.get(w.id)
      }))
      .filter(w => {
        const hasDescription = w.description && w.description.description;
        const hasEmbedding = existingIds.has(w.id);
        return hasDescription && !hasEmbedding;
      });

    const workflowsWithoutDescriptions = workflowsRaw.length - workflows.length - existingIds.size;

    console.log(`Processing ${workflows.length} workflows (${existingIds.size} already have embeddings, ${workflowsWithoutDescriptions} missing descriptions)`);

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const workflow of workflows) {
      try {
        const desc = workflow.description;
        
        // Validate we have the required fields (already checked in filter above)
        if (!desc || !desc.description) {
          console.log(`Workflow ${workflow.id} has empty description`);
          failCount++;
          continue;
        }
        
        // Create compact text for embedding
        const textForEmbedding = `${workflow.name}\n\n${desc.description}\n\nUse Cases:\n${desc.use_cases || ''}\n\nSetup:\n${desc.setup_guide || ''}`;

        // Generate embedding using Ollama Cloud with Deepseek model
        const embeddingResponse = await fetch(
          `${OLLAMA_CLOUD_ENDPOINT}/v1/embeddings`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OLLAMA_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'deepseek-v3.1:671b-cloud',
              input: textForEmbedding
            }),
          }
        );

        if (!embeddingResponse.ok) {
          const errorText = await embeddingResponse.text();
          console.error(`Embedding API error for workflow ${workflow.id}:`, embeddingResponse.status, errorText);
          errors.push(`Workflow ${workflow.id}: ${errorText}`);
          failCount++;
          continue;
        }

        const embeddingData = await embeddingResponse.json();
        const embedding = embeddingData.data?.[0]?.embedding;

        if (!embedding) {
          console.error(`No embedding returned for workflow ${workflow.id}`);
          errors.push(`Workflow ${workflow.id}: No embedding in response`);
          failCount++;
          continue;
        }

        // Store embedding in workflow_vectors table
        const { error: insertError } = await supabase
          .from('workflow_vectors')
          .upsert({
            workflow_id: workflow.id,
            embedding: embedding,
            description_text: textForEmbedding.substring(0, 1000), // Store first 1000 chars for reference
          });

        if (insertError) {
          console.error(`Error inserting embedding for workflow ${workflow.id}:`, insertError);
          errors.push(`Workflow ${workflow.id}: ${insertError.message}`);
          failCount++;
        } else {
          successCount++;
          console.log(`Successfully generated embedding for workflow ${workflow.id}`);
        }

      } catch (error) {
        console.error(`Error processing workflow ${workflow.id}:`, error);
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push(`Workflow ${workflow.id}: ${errorMsg}`);
        failCount++;
      }
    }

    const hasMore = workflowsRaw.length === limit;
    const nextOffset = hasMore ? offset + limit : null;

    return new Response(JSON.stringify({
      success: true,
      processed: workflows.length,
      successful: successCount,
      failed: failCount,
      errors: errors.slice(0, 10), // Return first 10 errors
      hasMore,
      nextOffset,
      totalSkipped: existingIds.size,
      missingDescriptions: workflowsWithoutDescriptions,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-embeddings function:', error);
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
