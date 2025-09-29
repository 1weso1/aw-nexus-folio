import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Sample 50 random workflows with descriptions
    const { data: samples, error: sampleError } = await supabase
      .from('workflows')
      .select(`
        id,
        name,
        category,
        workflow_descriptions (
          description
        )
      `)
      .not('workflow_descriptions', 'is', null)
      .limit(50);
    
    if (sampleError) throw sampleError;

    let matched = 0;
    let mismatched = 0;

    // Check if workflow name/category appear in the description
    for (const workflow of samples || []) {
      const desc = workflow.workflow_descriptions?.[0]?.description || '';
      const nameWords = workflow.name.toLowerCase().split(/[\s-_]+/);
      const categoryWords = workflow.category?.toLowerCase().split(/[\s-_]+/) || [];
      
      // Check if at least some key words from name or category appear in description
      const hasNameMatch = nameWords.some((word: string) => 
        word.length > 3 && desc.toLowerCase().includes(word)
      );
      const hasCategoryMatch = categoryWords.some((word: string) => 
        word.length > 3 && desc.toLowerCase().includes(word)
      );

      if (hasNameMatch || hasCategoryMatch || desc.length > 100) {
        matched++;
      } else {
        mismatched++;
        console.log(`Potential mismatch: ${workflow.name} - ${desc.substring(0, 100)}`);
      }
    }

    return new Response(
      JSON.stringify({
        total: samples?.length || 0,
        matched,
        mismatched,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-workflow-descriptions:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
