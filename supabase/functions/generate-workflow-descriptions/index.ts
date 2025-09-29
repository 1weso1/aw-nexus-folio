import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🔥 Function called, method:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('📦 Request body:', body);
    const { offset = 0, limit = 10 } = body;
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('🔑 Environment check:', {
      hasLovableKey: !!LOVABLE_API_KEY,
      hasSupabaseUrl: !!SUPABASE_URL,
      hasServiceRole: !!SUPABASE_SERVICE_ROLE_KEY,
    });

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      const missing = [];
      if (!LOVABLE_API_KEY) missing.push('LOVABLE_API_KEY');
      if (!SUPABASE_URL) missing.push('SUPABASE_URL');
      if (!SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch workflows that don't have descriptions yet
    console.log(`📊 Fetching workflows with offset ${offset}, limit ${limit}`);
    const { data: allWorkflows, error: allError } = await supabase
      .from('workflows')
      .select('id, name, category, node_count, has_credentials, complexity, raw_url')
      .range(offset, offset + limit - 1);
    
    console.log(`✅ Fetched ${allWorkflows?.length || 0} workflows`);
    if (allError) {
      console.error('❌ Error fetching workflows:', allError);
      throw allError;
    }

    // Filter out ones that already have descriptions
    const { data: existingDescriptions } = await supabase
      .from('workflow_descriptions')
      .select('workflow_id');
    
    console.log(`📝 Found ${existingDescriptions?.length || 0} existing descriptions`);
    
    const existingIds = new Set(existingDescriptions?.map(d => d.workflow_id) || []);
    const workflowsToProcess = allWorkflows?.filter(w => !existingIds.has(w.id)) || [];
    
    console.log(`🎯 Processing ${workflowsToProcess.length} workflows without descriptions`);
    
    const stats = {
      processed: 0,
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const workflow of workflowsToProcess) {
      stats.processed++;
      
      try {
        // Fetch workflow JSON
        const jsonResponse = await fetch(workflow.raw_url);
        const workflowJson = await jsonResponse.json();
        
        // Generate description using Lovable AI
        const prompt = `Analyze this n8n workflow and provide:
1. A clear, concise description (2-3 sentences) explaining what this workflow does
2. 3-5 practical use cases for this workflow
3. A step-by-step setup guide with any required credentials or configuration

Workflow Name: ${workflow.name}
Category: ${workflow.category}
Node Count: ${workflow.node_count}
Has Credentials: ${workflow.has_credentials}
Complexity: ${workflow.complexity}

Workflow JSON:
${JSON.stringify(workflowJson, null, 2)}

Format your response as JSON with these keys:
{
  "description": "clear description here",
  "use_cases": "bullet points of use cases",
  "setup_guide": "step-by-step setup instructions"
}`;

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: 'You are an expert at analyzing n8n automation workflows. Provide clear, practical descriptions and guides.'
              },
              { role: 'user', content: prompt }
            ],
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          throw new Error(`AI API error: ${aiResponse.status} - ${errorText}`);
        }

        const aiData = await aiResponse.json();
        const content = aiData.choices[0].message.content;
        
        // Try to parse JSON response
        let parsedContent;
        try {
          // Remove markdown code blocks if present
          const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
          parsedContent = JSON.parse(cleanContent);
        } catch {
          // If not JSON, split the content into sections
          parsedContent = {
            description: content.split('\n\n')[0] || content.substring(0, 300),
            use_cases: content.includes('use case') ? content.split('use case')[1]?.split('\n\n')[0] : 'General automation tasks',
            setup_guide: content.includes('setup') || content.includes('Setup') ? content.split(/setup|Setup/i)[1]?.split('\n\n')[0] : 'Import the workflow and configure the required credentials.'
          };
        }

        // Store in database
        const { error: insertError } = await supabase
          .from('workflow_descriptions')
          .insert({
            workflow_id: workflow.id,
            description: parsedContent.description,
            use_cases: parsedContent.use_cases,
            setup_guide: parsedContent.setup_guide,
          });

        if (insertError) {
          console.error('Error inserting description:', insertError);
          stats.errors.push(`${workflow.name}: ${insertError.message}`);
          stats.failed++;
        } else {
          stats.success++;
          console.log(`Generated description for: ${workflow.name}`);
        }

      } catch (error) {
        console.error(`Error processing workflow ${workflow.name}:`, error);
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        stats.errors.push(`${workflow.name}: ${errorMsg}`);
        stats.failed++;
      }
    }

    return new Response(
      JSON.stringify({
        ...stats,
        nextOffset: offset + limit,
        hasMore: workflowsToProcess.length === limit,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-workflow-descriptions:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});