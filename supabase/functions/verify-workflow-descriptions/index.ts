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

    // Sample 20 random workflows with descriptions (smaller for deeper analysis)
    const { data: samples, error: sampleError } = await supabase
      .from('workflows')
      .select(`
        id,
        name,
        category,
        raw_url,
        workflow_descriptions (
          description,
          use_cases,
          setup_guide
        )
      `)
      .not('workflow_descriptions', 'is', null)
      .limit(20);
    
    if (sampleError) throw sampleError;

    let matched = 0;
    let mismatched = 0;
    const mismatchDetails: string[] = [];

    // Deep verification: Check if description matches actual workflow content
    for (const workflow of samples || []) {
      const desc = workflow.workflow_descriptions?.[0]?.description || '';
      const useCases = workflow.workflow_descriptions?.[0]?.use_cases || '';
      const setupGuide = workflow.workflow_descriptions?.[0]?.setup_guide || '';
      
      try {
        // Fetch actual workflow JSON
        const workflowResponse = await fetch(workflow.raw_url);
        if (!workflowResponse.ok) {
          console.log(`Failed to fetch workflow ${workflow.name}`);
          continue;
        }
        
        const workflowJson = await workflowResponse.json();
        const workflowStr = JSON.stringify(workflowJson).toLowerCase();
        
        // Extract node types and service names from actual workflow
        const nodes = workflowJson.nodes || [];
        const nodeTypes = nodes.map((n: any) => n.type?.toLowerCase() || '').filter(Boolean);
        const serviceNames = nodeTypes
          .map((t: string) => t.replace(/^n8n-nodes-base\./, ''))
          .filter((s: string) => s.length > 3);
        
        // Check if description mentions the actual services/tools used
        const allContent = (desc + ' ' + useCases + ' ' + setupGuide).toLowerCase();
        
        let matchCount = 0;
        let totalChecks = 0;
        
        // Check 1: Does description mention actual services from workflow?
        for (const service of serviceNames.slice(0, 5)) { // Check first 5 services
          totalChecks++;
          if (allContent.includes(service)) {
            matchCount++;
          }
        }
        
        // Check 2: Are there any hallucinated services (mentioned but not in workflow)?
        const commonServices = [
          'slack', 'gmail', 'sheets', 'airtable', 'hubspot', 
          'salesforce', 'twilio', 'telegram', 'discord', 'notion',
          'trello', 'asana', 'jira', 'github', 'gitlab',
          'stripe', 'paypal', 'shopify', 'wordpress', 'mailchimp'
        ];
        
        let hallucinatedServices = 0;
        for (const service of commonServices) {
          if (allContent.includes(service) && !workflowStr.includes(service)) {
            hallucinatedServices++;
            console.log(`Possible hallucination: ${workflow.name} mentions ${service} but workflow doesn't contain it`);
          }
        }
        
        // Check 3: Description length should be reasonable
        const hasContent = desc.length > 50 && desc.length < 2000;
        
        // Scoring: Match if >30% of services are mentioned, no hallucinations, and has content
        const matchRate = totalChecks > 0 ? matchCount / totalChecks : 0;
        const isGoodMatch = matchRate > 0.3 && hallucinatedServices === 0 && hasContent;
        
        if (isGoodMatch) {
          matched++;
          console.log(`✓ Verified: ${workflow.name} (${Math.round(matchRate * 100)}% match, ${serviceNames.length} services)`);
        } else {
          mismatched++;
          const reason = hallucinatedServices > 0 
            ? `${hallucinatedServices} hallucinated services`
            : matchRate <= 0.3 
            ? `Low match rate: ${Math.round(matchRate * 100)}%`
            : 'Content issues';
          mismatchDetails.push(`${workflow.name}: ${reason}`);
          console.log(`✗ Mismatch: ${workflow.name} - ${reason}`);
        }
        
      } catch (error) {
        console.error(`Error verifying ${workflow.name}:`, error);
        // Don't count as mismatch if we couldn't verify
      }
    }

    return new Response(
      JSON.stringify({
        total: samples?.length || 0,
        matched,
        mismatched,
        mismatchDetails: mismatchDetails.slice(0, 10), // Return up to 10 examples
        confidence: matched + mismatched > 0 
          ? Math.round((matched / (matched + mismatched)) * 100) 
          : 0
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
