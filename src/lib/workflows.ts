import { MANIFEST_URL } from '@/config/workflows';
import type { WorkflowItem, WorkflowManifest, N8nWorkflow, WorkflowStats } from '@/types/workflow';

// Cache for manifest data
let manifestCache: WorkflowManifest | null = null;
let cacheExpiry: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// IndexedDB/localStorage cache key
const CACHE_KEY = 'workflows_manifest_v1';
const CACHE_TIMESTAMP_KEY = 'workflows_manifest_timestamp_v1';

// Load manifest from cache or server
export async function loadManifest(): Promise<WorkflowManifest> {
  // Check memory cache
  if (manifestCache && Date.now() < cacheExpiry) {
    return manifestCache;
  }

  try {
    // Try to fetch from server
    const response = await fetch(MANIFEST_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch manifest: ${response.status}`);
    }
    
    const manifest: WorkflowManifest = await response.json();
    
    // Update cache
    manifestCache = manifest;
    cacheExpiry = Date.now() + CACHE_TTL;
    
    // Store in localStorage as fallback
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(manifest));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (e) {
      console.warn('Failed to cache manifest in localStorage:', e);
    }
    
    return manifest;
    
  } catch (error) {
    console.error('Failed to load manifest from server:', error);
    
    // Try to load from localStorage cache
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const cachedTime = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      
      if (cached && cachedTime) {
        const age = Date.now() - parseInt(cachedTime);
        if (age < 24 * 60 * 60 * 1000) { // Use cache if less than 24 hours old
          const manifest = JSON.parse(cached);
          manifestCache = manifest;
          cacheExpiry = Date.now() + CACHE_TTL;
          console.log('Using cached manifest (offline mode)');
          return manifest;
        }
      }
    } catch (e) {
      console.error('Failed to load cached manifest:', e);
    }
    
    // Return empty array as last resort
    console.error('No manifest available - returning empty array');
    return [];
  }
}

// Fetch raw workflow JSON
export async function fetchWorkflowRaw(rawUrl: string): Promise<N8nWorkflow> {
  try {
    const response = await fetch(rawUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch workflow: ${response.status} ${response.statusText}`);
    }
    
    const workflow = await response.json();
    
    // Validate n8n workflow structure
    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      throw new Error('Invalid n8n workflow structure');
    }
    
    return workflow;
    
  } catch (error) {
    console.error('Failed to fetch workflow:', error);
    throw new Error(`Unable to load workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Filter workflows by category
export function filterByCategory(workflows: WorkflowManifest, categories: string[]): WorkflowManifest {
  if (categories.length === 0) return workflows;
  return workflows.filter(workflow => categories.includes(workflow.category));
}

// Filter workflows by tags
export function filterByTags(workflows: WorkflowManifest, tags: string[]): WorkflowManifest {
  if (tags.length === 0) return workflows;
  return workflows.filter(workflow => 
    tags.some(tag => workflow.tags.includes(tag))
  );
}

// Filter workflows by complexity
export function filterByComplexity(workflows: WorkflowManifest, complexities: string[]): WorkflowManifest {
  if (complexities.length === 0) return workflows;
  return workflows.filter(workflow => complexities.includes(workflow.complexity));
}

// Filter workflows that have credentials
export function filterByCredentials(workflows: WorkflowManifest, hasCredentials?: boolean): WorkflowManifest {
  if (hasCredentials === undefined) return workflows;
  return workflows.filter(workflow => workflow.hasCredentials === hasCredentials);
}

// Search workflows by name, description, tags, or integrations
export function searchWorkflows(workflows: WorkflowManifest, query: string): WorkflowManifest {
  if (!query.trim()) return workflows;
  
  const searchTerm = query.toLowerCase().trim();
  
  return workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchTerm) ||
    workflow.description?.toLowerCase().includes(searchTerm) ||
    workflow.category.toLowerCase().includes(searchTerm) ||
    workflow.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    workflow.folderName?.toLowerCase().includes(searchTerm)
  );
}

// Sort workflows
export function sortWorkflows(
  workflows: WorkflowManifest, 
  sortBy: 'name' | 'nodeCount' | 'updatedAt' | 'complexity',
  direction: 'asc' | 'desc' = 'asc'
): WorkflowManifest {
  const sorted = [...workflows].sort((a, b) => {
    let aVal, bVal;
    
    switch (sortBy) {
      case 'name':
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case 'nodeCount':
        aVal = a.nodeCount;
        bVal = b.nodeCount;
        break;
      case 'updatedAt':
        aVal = new Date(a.updatedAt).getTime();
        bVal = new Date(b.updatedAt).getTime();
        break;
      case 'complexity':
        const complexityOrder = { 'Easy': 1, 'Medium': 2, 'Advanced': 3 };
        aVal = complexityOrder[a.complexity];
        bVal = complexityOrder[b.complexity];
        break;
      default:
        return 0;
    }
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
  
  return sorted;
}

// Get unique categories from workflows
export function getCategories(workflows: WorkflowManifest): string[] {
  return [...new Set(workflows.map(w => w.category))].sort();
}

// Get unique tags from workflows
export function getTags(workflows: WorkflowManifest): string[] {
  return [...new Set(workflows.flatMap(w => w.tags))].sort();
}

// Get workflow statistics
export function getWorkflowStats(workflows: WorkflowManifest): WorkflowStats {
  return {
    totalWorkflows: workflows.length,
    totalCategories: getCategories(workflows).length,
    totalIntegrations: getTags(workflows).length,
    averageSetupTime: workflows.length > 0 
      ? Math.round(workflows.reduce((acc, w) => acc + (parseInt(w.description?.match(/(\d+)\s*minutes?/)?.[1] || '30')), 0) / workflows.length)
      : 0
  };
}

// Get workflow by ID
export function getWorkflowById(workflows: WorkflowManifest, id: string): WorkflowItem | undefined {
  return workflows.find(w => w.id === id);
}

// Get related workflows (same category or shared tags)
export function getRelatedWorkflows(
  workflows: WorkflowManifest, 
  workflow: WorkflowItem, 
  limit: number = 6
): WorkflowManifest {
  const related = workflows
    .filter(w => w.id !== workflow.id)
    .map(w => {
      let score = 0;
      
      // Same category gets high score
      if (w.category === workflow.category) score += 10;
      
      // Shared tags get medium score
      const sharedTags = w.tags.filter(tag => workflow.tags.includes(tag));
      score += sharedTags.length * 2;
      
      // Same complexity gets small score
      if (w.complexity === workflow.complexity) score += 1;
      
      return { workflow: w, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.workflow);
    
  return related;
}