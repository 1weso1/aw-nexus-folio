#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { WORKFLOWS_REPO, WORKFLOWS_BRANCH, GITHUB_API_BASE, GITHUB_RAW_BASE, GITHUB_TOKEN } from '../src/config/workflows.js';
import type { WorkflowItem, WorkflowManifest, N8nWorkflow, WorkflowComplexity } from '../src/types/workflow.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const WORKFLOWS_DIR = path.join(PUBLIC_DIR, 'workflows');
const SAMPLES_DIR = path.join(WORKFLOWS_DIR, 'samples');

// Ensure directories exist
async function ensureDirectories() {
  await fs.mkdir(WORKFLOWS_DIR, { recursive: true });
  await fs.mkdir(SAMPLES_DIR, { recursive: true });
}

// GitHub API client with rate limiting
class GitHubClient {
  private baseUrl = GITHUB_API_BASE;
  private headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'n8n-workflows-sync',
  };

  constructor() {
    if (GITHUB_TOKEN) {
      this.headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }
  }

  async request(endpoint: string): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, { headers: this.headers });
      
      if (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0') {
        const resetTime = response.headers.get('x-ratelimit-reset');
        throw new Error(`GitHub API rate limit exceeded. Resets at ${new Date(parseInt(resetTime!) * 1000)}`);
      }
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch ${url}:`, error);
      throw error;
    }
  }
}

// Detect workflow category from path
function detectCategory(path: string): string {
  const segments = path.split('/');
  const folder = segments[segments.length - 2] || segments[segments.length - 1];
  
  const categoryMap: Record<string, string> = {
    'hubspot': 'CRM & Sales',
    'salesforce': 'CRM & Sales', 
    'pipedrive': 'CRM & Sales',
    'zoho': 'CRM & Sales',
    'mailchimp': 'Marketing',
    'activecampaign': 'Marketing',
    'facebook': 'Marketing',
    'googleads': 'Marketing',
    'slack': 'Communication',
    'discord': 'Communication',
    'telegram': 'Communication',
    'twitter': 'Social Media',
    'instagram': 'Social Media',
    'linkedin': 'Social Media',
    'airtable': 'Business Operations',
    'googlesheets': 'Business Operations',
    'asana': 'Business Operations',
    'trello': 'Business Operations',
    'shopify': 'E-commerce',
    'stripe': 'E-commerce',
    'openai': 'AI-Powered',
    'chatgpt': 'AI-Powered',
    'anthropic': 'AI-Powered',
    'googledrive': 'File Management',
    'aws': 'Cloud Services'
  };
  
  for (const [key, category] of Object.entries(categoryMap)) {
    if (folder.toLowerCase().includes(key)) {
      return category;
    }
  }
  
  return 'General';
}

// Extract tags from workflow content
function extractTags(workflow: N8nWorkflow, path: string): string[] {
  const tags = new Set<string>();
  
  // Add tags based on node types
  workflow.nodes?.forEach(node => {
    const nodeType = node.type.toLowerCase();
    
    // Common service integrations
    const services = [
      'hubspot', 'salesforce', 'pipedrive', 'mailchimp', 'slack', 'telegram',
      'discord', 'twitter', 'instagram', 'facebook', 'google', 'airtable',
      'notion', 'trello', 'asana', 'shopify', 'stripe', 'openai', 'webhook'
    ];
    
    services.forEach(service => {
      if (nodeType.includes(service)) {
        tags.add(service);
      }
    });
    
    // Add general tags
    if (nodeType.includes('http') || nodeType.includes('webhook')) tags.add('api');
    if (nodeType.includes('email')) tags.add('email');
    if (nodeType.includes('schedule')) tags.add('scheduling');
    if (nodeType.includes('code') || nodeType.includes('function')) tags.add('custom-code');
  });
  
  // Add tags from path
  const pathLower = path.toLowerCase();
  if (pathLower.includes('automation')) tags.add('automation');
  if (pathLower.includes('crm')) tags.add('crm');
  if (pathLower.includes('lead')) tags.add('leads');
  if (pathLower.includes('marketing')) tags.add('marketing');
  if (pathLower.includes('social')) tags.add('social-media');
  
  return Array.from(tags);
}

// Check if workflow requires credentials
function hasCredentials(workflow: N8nWorkflow): boolean {
  return workflow.nodes?.some(node => 
    node.credentials || 
    node.type.toLowerCase().includes('auth') ||
    node.parameters?.authentication
  ) || false;
}

// Determine workflow complexity
function getComplexity(nodeCount: number): WorkflowComplexity {
  if (nodeCount <= 8) return 'Easy';
  if (nodeCount <= 20) return 'Medium';
  return 'Advanced';
}

// Fetch and parse a single workflow
async function fetchWorkflow(client: GitHubClient, path: string, item: any): Promise<WorkflowItem | null> {
  try {
    const rawUrl = `${GITHUB_RAW_BASE}/${WORKFLOWS_REPO}/${WORKFLOWS_BRANCH}/${path}`;
    const response = await fetch(rawUrl);
    
    if (!response.ok) {
      console.warn(`Failed to fetch workflow ${path}: ${response.status}`);
      return null;
    }
    
    const content = await response.text();
    let workflow: N8nWorkflow;
    
    try {
      workflow = JSON.parse(content);
    } catch (error) {
      console.warn(`Failed to parse workflow ${path}:`, error);
      return null;
    }
    
    // Validate it's an n8n workflow
    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      console.warn(`Invalid n8n workflow structure in ${path}`);
      return null;
    }
    
    const nodeCount = workflow.nodes.length;
    const name = path.split('/').pop()?.replace('.json', '') || path;
    
    return {
      id: item.sha || path.replace(/[^a-z0-9]/gi, '-').toLowerCase(),
      name: name.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      path,
      rawUrl,
      size: item.size || content.length,
      updatedAt: new Date().toISOString(), // GitHub doesn't provide file-level update times easily
      category: detectCategory(path),
      tags: extractTags(workflow, path),
      nodeCount,
      hasCredentials: hasCredentials(workflow),
      complexity: getComplexity(nodeCount),
      folderName: path.split('/').slice(-2, -1)[0] || 'misc'
    };
  } catch (error) {
    console.error(`Error processing workflow ${path}:`, error);
    return null;
  }
}

// Main sync function
async function syncWorkflows() {
  console.log('🔄 Syncing workflows from GitHub...');
  
  try {
    await ensureDirectories();
    
    const client = new GitHubClient();
    const workflows: WorkflowItem[] = [];
    
    // Get repository tree
    console.log(`📡 Fetching repository tree for ${WORKFLOWS_REPO}...`);
    const tree = await client.request(`/repos/${WORKFLOWS_REPO}/git/trees/${WORKFLOWS_BRANCH}?recursive=1`);
    
    // Filter JSON files that look like workflows
    const workflowFiles = tree.tree.filter((item: any) => 
      item.type === 'blob' && 
      item.path.endsWith('.json') &&
      !item.path.includes('package') &&
      !item.path.includes('manifest')
    );
    
    console.log(`📂 Found ${workflowFiles.length} potential workflow files`);
    
    // Process workflows in batches to avoid rate limits
    const BATCH_SIZE = 10;
    for (let i = 0; i < workflowFiles.length; i += BATCH_SIZE) {
      const batch = workflowFiles.slice(i, i + BATCH_SIZE);
      console.log(`⚙️  Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(workflowFiles.length / BATCH_SIZE)}...`);
      
      const batchPromises = batch.map(item => fetchWorkflow(client, item.path, item));
      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        if (result) workflows.push(result);
      });
      
      // Small delay between batches
      if (i + BATCH_SIZE < workflowFiles.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`✅ Successfully processed ${workflows.length} workflows`);
    
    // Write manifest
    const manifestPath = path.join(WORKFLOWS_DIR, 'manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(workflows, null, 2), 'utf-8');
    
    // Download sample workflows for instant demos (first 50)
    console.log('📥 Downloading sample workflows...');
    const samples = workflows.slice(0, 50);
    
    for (const workflow of samples) {
      try {
        const response = await fetch(workflow.rawUrl);
        if (response.ok) {
          const content = await response.text();
          const samplePath = path.join(SAMPLES_DIR, `${workflow.id}.json`);
          await fs.writeFile(samplePath, content, 'utf-8');
        }
      } catch (error) {
        console.warn(`Failed to download sample ${workflow.id}:`, error);
      }
    }
    
    console.log(`🎉 Sync complete! Generated manifest with ${workflows.length} workflows`);
    
    // Print statistics
    const categories = [...new Set(workflows.map(w => w.category))];
    const integrations = [...new Set(workflows.flatMap(w => w.tags))];
    
    console.log('\n📊 Statistics:');
    console.log(`   • ${workflows.length} total workflows`);
    console.log(`   • ${categories.length} categories`);
    console.log(`   • ${integrations.length} unique integrations`);
    console.log(`   • ${samples.length} sample workflows downloaded`);
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncWorkflows();
}

export { syncWorkflows };