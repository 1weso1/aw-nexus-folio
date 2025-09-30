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
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch workflows that don't have embeddings yet
    const { data: workflows, error: fetchError } = await supabase
      .from('workflows')
      .select(`
        id,
        name,
        workflow_descriptions (
          description,
          use_cases,
          setup_guide
        )
      `)
      .not('workflow_descriptions', 'is', null)
      .range(offset, offset + limit - 1);

    if (fetchError) {
      console.error('Error fetching workflows:', fetchError);
      throw fetchError;
    }

    if (!workflows || workflows.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        processed: 0, 
        message: 'No workflows to process' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check which workflows already have embeddings
    const workflowIds = workflows.map(w => w.id);
    const { data: existingEmbeddings } = await supabase
      .from('workflow_vectors')
      .select('workflow_id')
      .in('workflow_id', workflowIds);

    const existingIds = new Set(existingEmbeddings?.map(e => e.workflow_id) || []);
    const workflowsToProcess = workflows.filter(w => !existingIds.has(w.id));

    console.log(`Processing ${workflowsToProcess.length} workflows (${existingIds.size} already have embeddings)`);

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const workflow of workflowsToProcess) {
      try {
        const descriptions = workflow.workflow_descriptions as any;
        if (!descriptions || descriptions.length === 0) {
          console.log(`No description found for workflow ${workflow.id}`);
          failCount++;
          continue;
        }

        const desc = descriptions[0];
        
        // Create compact text for embedding (use existing description)
        const textForEmbedding = `${workflow.name}\n\n${desc.description}\n\nUse Cases:\n${desc.use_cases || ''}\n\nSetup:\n${desc.setup_guide || ''}`;

        // Generate embedding using Gemini text-embedding-004
        const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'text-embedding-004',
            input: textForEmbedding,
          }),
        });

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

    const hasMore = workflows.length === limit;
    const nextOffset = hasMore ? offset + limit : null;

    return new Response(JSON.stringify({
      success: true,
      processed: workflowsToProcess.length,
      successful: successCount,
      failed: failCount,
      errors: errors.slice(0, 10), // Return first 10 errors
      hasMore,
      nextOffset,
      totalSkipped: existingIds.size,
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
