/**
 * Sync Workflows Edge Function
 * 
 * Syncs n8n workflows from GitHub repository using Git Trees API with batch processing.
 * 
 * Usage:
 * POST /functions/v1/sync-workflows?offset=0&limit=100
 * 
 * Query Parameters:
 * - offset: Starting index for batch processing (default: 0)
 * - limit: Number of workflows to process in this batch (default: 100)
 * 
 * Response includes nextOffset for continuation or null when finished.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

interface GitTreeItem {
  path: string
  mode: string
  type: string
  sha: string
  size?: number
  url: string
}

interface GitTreeResponse {
  sha: string
  url: string
  tree: GitTreeItem[]
  truncated: boolean
}

interface WorkflowData {
  name: string
  nodes: any[]
  [key: string]: any
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    // Get environment variables
    const WORKFLOWS_REPO = Deno.env.get('WORKFLOWS_REPO')
    const WORKFLOWS_BRANCH = Deno.env.get('WORKFLOWS_BRANCH')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN')

    if (!WORKFLOWS_REPO || !WORKFLOWS_BRANCH || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ 
        error: 'Missing required environment variables',
        status: 'error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Parse query parameters
    const url = new URL(req.url)
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const limit = parseInt(url.searchParams.get('limit') || '100')

    console.log(`Starting sync batch: offset=${offset}, limit=${limit}`)

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Prepare GitHub API headers
    const githubHeaders: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Supabase-Edge-Function'
    }
    if (GITHUB_TOKEN) {
      githubHeaders['Authorization'] = `token ${GITHUB_TOKEN}`
    }

    // Fetch repository tree using Git Trees API
    console.log('Fetching repository tree...')
    const treeUrl = `https://api.github.com/repos/${WORKFLOWS_REPO}/git/trees/${WORKFLOWS_BRANCH}?recursive=1`
    const treeResponse = await fetch(treeUrl, { headers: githubHeaders })

    if (!treeResponse.ok) {
      const errorText = await treeResponse.text()
      console.error('GitHub API error:', treeResponse.status, errorText)
      return new Response(JSON.stringify({ 
        error: `GitHub API error: ${treeResponse.status}`,
        details: errorText,
        status: 'error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const treeData: GitTreeResponse = await treeResponse.json()
    console.log(`Tree fetched. Truncated: ${treeData.truncated}`)

    // Filter for JSON files only
    const jsonFiles = treeData.tree.filter(item => 
      item.type === 'blob' && item.path.endsWith('.json')
    )

    console.log(`Found ${jsonFiles.length} JSON files total`)

    // Calculate batch
    const batchFiles = jsonFiles.slice(offset, offset + limit)
    const total = jsonFiles.length
    const processed = batchFiles.length
    const nextOffset = offset + limit >= total ? null : offset + limit

    console.log(`Processing batch of ${processed} files`)

    // Process each file in the batch
    let inserted = 0
    let skipped = 0
    let errorsCount = 0

    for (const file of batchFiles) {
      try {
        // Generate stable slug from path
        const slug = file.path
          .replace(/\.json$/, '')
          .replace(/[^a-zA-Z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
          .toLowerCase()

        // Fetch file content
        const rawUrl = `https://raw.githubusercontent.com/${WORKFLOWS_REPO}/${WORKFLOWS_BRANCH}/${file.path}`
        const fileResponse = await fetch(rawUrl, { headers: githubHeaders })

        if (!fileResponse.ok) {
          console.warn(`Failed to fetch ${file.path}: ${fileResponse.status}`)
          skipped++
          continue
        }

        let workflowData: WorkflowData
        try {
          workflowData = await fileResponse.json()
        } catch (parseError) {
          console.warn(`Failed to parse JSON for ${file.path}:`, parseError)
          skipped++
          continue
        }

        // Validate workflow structure
        if (!workflowData.nodes || !Array.isArray(workflowData.nodes)) {
          console.warn(`Invalid workflow structure in ${file.path}: missing or invalid nodes`)
          skipped++
          continue
        }

        // Extract workflow metadata
        const name = workflowData.name || file.path.split('/').pop()?.replace('.json', '') || slug
        const nodeCount = workflowData.nodes.length
        const hasCredentials = JSON.stringify(workflowData).includes('credentials')
        
        // Determine complexity based on node count
        let complexity = 'Easy'
        if (nodeCount >= 20) {
          complexity = 'Advanced'
        } else if (nodeCount >= 8) {
          complexity = 'Medium'
        }

        // Determine category from path
        const pathParts = file.path.split('/')
        const category = pathParts.length > 1 ? pathParts[0] : 'General'

        // Get file size and last modified (use current time as approximation)
        const sizeBytes = file.size || 0
        const updatedAt = new Date().toISOString()

        console.log(`Processing: ${name} (${nodeCount} nodes, ${complexity})`)

        // Call upsert_workflow function
        const { error: upsertError } = await supabase.rpc('upsert_workflow', {
          p_slug: slug,
          p_name: name,
          p_path: file.path,
          p_raw_url: rawUrl,
          p_size: sizeBytes,
          p_updated: updatedAt,
          p_category: category,
          p_node_count: nodeCount,
          p_has_credentials: hasCredentials,
          p_complexity: complexity,
          p_tags: [] // Empty for now as requested
        })

        if (upsertError) {
          console.error(`Failed to upsert workflow ${slug}:`, upsertError)
          errorsCount++
        } else {
          inserted++
        }

      } catch (error) {
        console.error(`Error processing file ${file.path}:`, error)
        errorsCount++
      }
    }

    console.log(`Batch completed: ${inserted} inserted, ${skipped} skipped, ${errorsCount} errors`)

    // Return comprehensive response
    const response = {
      repo: WORKFLOWS_REPO,
      branch: WORKFLOWS_BRANCH,
      total,
      processed,
      offset,
      limit,
      nextOffset,
      inserted,
      skipped,
      errorsCount,
      truncated: treeData.truncated,
      status: 'success'
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Sync workflows function error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      status: 'error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})