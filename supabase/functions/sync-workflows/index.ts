import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GITHUB_REPO = "zie619/n8n-workflows";
const GITHUB_BRANCH = "main";
const GITHUB_ROOT = "";
const GITHUB_API_BASE = "https://api.github.com";

interface N8nWorkflow {
  nodes: Array<{
    type: string;
    parameters?: any;
    credentials?: any;
  }>;
  connections?: any;
}

interface GitHubFile {
  name: string;
  path: string;
  size: number;
  sha: string;
  download_url: string;
  type: string;
}

// Detect providers from node types and parameters
function extractTags(workflow: N8nWorkflow, path: string): string[] {
  const tags = new Set<string>();
  const providers = ["hubspot", "gmail", "google", "sheets", "telegram", "twilio", 
                   "slack", "notion", "airtable", "stripe", "shopify", "whatsapp", 
                   "openai", "http", "webhook", "zoom", "discord", "linkedin"];
  
  // Check nodes for provider names
  for (const node of workflow.nodes || []) {
    const nodeType = node.type?.toLowerCase() || '';
    for (const provider of providers) {
      if (nodeType.includes(provider)) {
        tags.add(provider);
      }
    }
  }

  // Extract from path
  const pathLower = path.toLowerCase();
  for (const provider of providers) {
    if (pathLower.includes(provider)) {
      tags.add(provider);
    }
  }

  return Array.from(tags);
}

function detectCategory(path: string): string {
  const segments = path.split('/');
  if (segments.length > 1) {
    return segments[0].replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  return 'General';
}

function hasCredentials(workflow: N8nWorkflow): boolean {
  return workflow.nodes?.some(node => 
    node.credentials || 
    node.type?.toLowerCase().includes('credential') ||
    node.parameters?.authentication
  ) || false;
}

function getComplexity(nodeCount: number): string {
  if (nodeCount <= 8) return 'Easy';
  if (nodeCount <= 20) return 'Medium';
  return 'Advanced';
}

function createSlug(path: string): string {
  return path.replace(/[^a-z0-9]/gi, '-').toLowerCase();
}

async function fetchGitHubFiles(token?: string): Promise<GitHubFile[]> {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Lovable-Supabase-Sync/1.0'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${GITHUB_API_BASE}/repos/${GITHUB_REPO}/git/trees/${GITHUB_BRANCH}?recursive=1`;
  console.log('Fetching GitHub tree:', url);
  
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  return data.tree
    ?.filter((item: any) => 
      item.type === 'blob' && 
      item.path.endsWith('.json') &&
      (!GITHUB_ROOT || item.path.startsWith(GITHUB_ROOT))
    )
    ?.map((item: any) => ({
      name: item.path.split('/').pop()?.replace('.json', '') || '',
      path: item.path,
      size: item.size || 0,
      sha: item.sha,
      download_url: `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${item.path}`,
      type: 'file'
    })) || [];
}

async function processWorkflow(file: GitHubFile, supabaseServiceRole: string): Promise<void> {
  try {
    console.log(`Processing workflow: ${file.path}`);
    
    // Fetch workflow JSON
    const workflowResponse = await fetch(file.download_url);
    if (!workflowResponse.ok) {
      console.error(`Failed to fetch workflow ${file.path}: ${workflowResponse.status}`);
      return;
    }
    
    const workflowData: N8nWorkflow = await workflowResponse.json();
    
    // Validate it's an n8n workflow
    if (!workflowData.nodes || !Array.isArray(workflowData.nodes)) {
      console.log(`Skipping ${file.path}: not a valid n8n workflow`);
      return;
    }

    // Extract metadata
    const slug = createSlug(file.path);
    const name = file.name || file.path.split('/').pop()?.replace('.json', '') || 'Unnamed';
    const category = detectCategory(file.path);
    const tags = extractTags(workflowData, file.path);
    const nodeCount = workflowData.nodes.length;
    const credentials = hasCredentials(workflowData);
    const complexity = getComplexity(nodeCount);
    
    // Create Supabase admin client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      supabaseServiceRole
    );

    // Upsert workflow
    const { error } = await supabase.rpc('upsert_workflow', {
      p_slug: slug,
      p_name: name,
      p_path: file.path,
      p_raw_url: file.download_url,
      p_size: file.size,
      p_updated: new Date().toISOString(),
      p_category: category,
      p_node_count: nodeCount,
      p_has_credentials: credentials,
      p_complexity: complexity,
      p_tags: tags
    });

    if (error) {
      console.error(`Error upserting workflow ${file.path}:`, error);
    } else {
      console.log(`Successfully processed: ${file.path} (${nodeCount} nodes, ${tags.join(', ')})`);
    }
  } catch (error) {
    console.error(`Error processing workflow ${file.path}:`, error);
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting workflow sync...');
    
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseServiceRole) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY not found');
    }

    const githubToken = Deno.env.get('GITHUB_TOKEN');
    
    // Fetch all workflow files from GitHub
    const files = await fetchGitHubFiles(githubToken);
    console.log(`Found ${files.length} workflow files`);
    
    // Process workflows in batches to avoid overwhelming the API
    const batchSize = 10;
    let processed = 0;
    let errors = 0;
    
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(files.length / batchSize)}`);
      
      await Promise.allSettled(
        batch.map(async (file) => {
          try {
            await processWorkflow(file, supabaseServiceRole);
            processed++;
          } catch (error) {
            console.error(`Error in batch processing:`, error);
            errors++;
          }
        })
      );
      
      // Rate limiting
      if (i + batchSize < files.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Sync completed. Processed: ${processed}, Errors: ${errors}`);
    
    return new Response(JSON.stringify({
      success: true,
      message: `Sync completed. Processed: ${processed}, Errors: ${errors}`,
      processed,
      errors,
      total: files.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sync_workflows function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});