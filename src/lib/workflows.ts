import { supabase } from '@/lib/supabase';
import { WorkflowManifest, WorkflowItem, N8nWorkflow, WorkflowStats, WorkflowComplexity } from "@/types/workflow";
import { MANIFEST_URL } from "@/config/workflows";

// Simple basic workflow fetching function with error handling
export async function listWorkflowsBasic(page = 1, pageSize = 24, search = '') {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  let q = supabase
    .from('workflows')
    .select('*', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(from, to);
    
  if (search) {
    q = q.ilike('name', `%${search}%`);
  }
  
  const { data, error, count } = await q;
  
  if (error) console.error('Supabase query error:', error);
  
  return { 
    items: data ?? [], 
    total: count ?? 0,
    error 
  };
}

// Supabase-based workflow data layer with static fallback

export interface WorkflowFilters {
  query?: string;
  categories?: string[];
  tags?: string[];
  complexity?: WorkflowComplexity[];
  hasCredentials?: boolean;
}

export interface WorkflowSort {
  field: 'name' | 'node_count' | 'updated_at' | 'complexity';
  direction: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Memory cache for categories and tags
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getFromCache<T>(key: string): T | null {
  const item = cache.get(key);
  if (!item || Date.now() - item.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// Static fallback for when Supabase is unavailable
async function loadStaticManifest(): Promise<WorkflowManifest> {
  try {
    const response = await fetch(MANIFEST_URL);
    if (!response.ok) throw new Error('Manifest not found');
    return await response.json();
  } catch (error) {
    console.warn('Failed to load static manifest:', error);
    return [];
  }
}

// Primary data access functions using Supabase
export async function listWorkflows({
  query,
  categories = [],
  tags = [],
  complexity = [],
  hasCredentials,
  sort = { field: 'name', direction: 'asc' },
  page = 1,
  pageSize = 50
}: {
  query?: string;
  categories?: string[];
  tags?: string[];
  complexity?: WorkflowComplexity[];
  hasCredentials?: boolean;
  sort?: WorkflowSort;
  page?: number;
  pageSize?: number;
} = {}): Promise<PaginatedResponse<WorkflowItem>> {
  try {
    let supabaseQuery = supabase
      .from('workflows')
      .select(`
        *,
        workflow_tags(
          tags(name)
        )
      `, { count: 'exact' });

    // Apply filters
    if (query) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,category.ilike.%${query}%`);
    }

    if (categories.length > 0) {
      supabaseQuery = supabaseQuery.in('category', categories);
    }

    if (complexity.length > 0) {
      supabaseQuery = supabaseQuery.in('complexity', complexity);
    }

    if (hasCredentials !== undefined) {
      supabaseQuery = supabaseQuery.eq('has_credentials', hasCredentials);
    }

    // Apply sorting
    const orderColumn = sort.field === 'name' ? 'name' : 
                       sort.field === 'node_count' ? 'node_count' : 
                       sort.field === 'updated_at' ? 'updated_at' : 'name';
    
    supabaseQuery = supabaseQuery.order(orderColumn, { ascending: sort.direction === 'asc' });

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    supabaseQuery = supabaseQuery.range(from, to);

    const { data, count, error } = await supabaseQuery;

    if (error) throw error;

    // Transform data to match expected format
    const workflows: WorkflowItem[] = (data || []).map(row => ({
      id: row.slug,
      name: row.name,
      path: row.path,
      rawUrl: row.raw_url,
      size: row.size_bytes || 0,
      updatedAt: row.updated_at,
      category: row.category,
      tags: row.workflow_tags?.map((wt: any) => wt.tags?.name).filter(Boolean) || [],
      nodeCount: row.node_count || 0,
      hasCredentials: row.has_credentials || false,
      complexity: row.complexity as WorkflowComplexity
    }));

    // Filter by tags if specified (post-processing due to complex join)
    const filteredWorkflows = tags.length > 0 
      ? workflows.filter(w => tags.some(tag => w.tags.includes(tag)))
      : workflows;

    return {
      data: filteredWorkflows,
      total: count || 0,
      page,
      pageSize,
      hasMore: (page * pageSize) < (count || 0)
    };

  } catch (error) {
    console.error('Supabase query failed, falling back to static data:', error);
    
    // Only fallback to static data on actual errors (network/connection issues)
    // NOT when database is simply empty (count = 0)
    const staticData = await loadStaticManifest();
    const filtered = filterStaticWorkflows(staticData, { query, categories, tags, complexity, hasCredentials });
    const sorted = sortStaticWorkflows(filtered, sort);
    
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    
    return {
      data: sorted.slice(from, to),
      total: sorted.length,
      page,
      pageSize,
      hasMore: to < sorted.length
    };
  }
}

export async function getWorkflowBySlug(slug: string): Promise<WorkflowItem | null> {
  try {
    const { data, error } = await supabase
      .from('workflows')
      .select(`
        *,
        workflow_tags(
          tags(name)
        )
      `)
      .eq('slug', slug)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.slug,
      name: data.name,
      path: data.path,
      rawUrl: data.raw_url,
      size: data.size_bytes || 0,
      updatedAt: data.updated_at,
      category: data.category,
      tags: data.workflow_tags?.map((wt: any) => wt.tags?.name).filter(Boolean) || [],
      nodeCount: data.node_count || 0,
      hasCredentials: data.has_credentials || false,
      complexity: data.complexity as WorkflowComplexity
    };
  } catch (error) {
    console.error('Failed to fetch workflow by slug:', error);
    
    // Fallback to static data
    const staticData = await loadStaticManifest();
    return staticData.find(w => w.id === slug) || null;
  }
}

export async function getRelatedWorkflows(slug: string, limit: number = 6): Promise<WorkflowItem[]> {
  try {
    const workflow = await getWorkflowBySlug(slug);
    if (!workflow) return [];

    const { data, error } = await supabase
      .from('workflows')
      .select(`
        *,
        workflow_tags(
          tags(name)
        )
      `)
      .eq('category', workflow.category)
      .neq('slug', slug)
      .limit(limit);

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.slug,
      name: row.name,
      path: row.path,
      rawUrl: row.raw_url,
      size: row.size_bytes || 0,
      updatedAt: row.updated_at,
      category: row.category,
      tags: row.workflow_tags?.map((wt: any) => wt.tags?.name).filter(Boolean) || [],
      nodeCount: row.node_count || 0,
      hasCredentials: row.has_credentials || false,
      complexity: row.complexity as WorkflowComplexity
    }));
  } catch (error) {
    console.error('Failed to fetch related workflows:', error);
    return [];
  }
}

export async function getCategories(): Promise<string[]> {
  const cached = getFromCache<string[]>('categories');
  if (cached) return cached;

  try {
    const { data, error } = await supabase
      .from('workflows')
      .select('category')
      .order('category');

    if (error) throw error;

    const categories = [...new Set(data?.map(row => row.category).filter(Boolean) || [])];
    setCache('categories', categories);
    return categories;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export async function getTags(): Promise<string[]> {
  const cached = getFromCache<string[]>('tags');
  if (cached) return cached;

  try {
    const { data, error } = await supabase
      .from('tags')
      .select('name')
      .order('name');

    if (error) throw error;

    const tags = data?.map(row => row.name) || [];
    setCache('tags', tags);
    return tags;
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return [];
  }
}

export type ListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  tagFilters?: string[]; // lowercase tags to match category
};

export async function listWorkflowsByTags({ page = 1, pageSize = 24, search = "", tagFilters = [] }: ListParams) {
  try {
    console.log('listWorkflowsByTags called with:', { page, pageSize, search, tagFilters });
    
    // 1) if category has tag filters, get tag ids
    let workflowIds: string[] | null = null;

    if (tagFilters.length) {
      console.log('Fetching tag IDs for:', tagFilters);
      const { data: tagRows, error: tagErr } = await supabase
        .from("tags")
        .select("id,name")
        .in("name", tagFilters);
      if (tagErr) throw tagErr;

      console.log('Found tags:', tagRows);
      const tagIds = (tagRows ?? []).map(t => t.id);
      if (tagIds.length) {
        const { data: wtRows, error: wtErr } = await supabase
          .from("workflow_tags")
          .select("workflow_id")
          .in("tag_id", tagIds)
          .limit(10000); // plenty for category scopes
        if (wtErr) throw wtErr;
        workflowIds = [...new Set((wtRows ?? []).map(r => r.workflow_id))];
        console.log('Found workflow IDs:', workflowIds.length);
        if (!workflowIds.length) workflowIds = ["00000000-0000-0000-0000-000000000000"]; // return empty
      } else {
        console.log('No matching tags found, returning empty result');
        workflowIds = ["00000000-0000-0000-0000-000000000000"]; // return empty
      }
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("workflows")
      .select(`
        *,
        workflow_tags(
          tags(name)
        )
      `, { count: "exact" })
      .order("updated_at", { ascending: false })
      .range(from, to);

    if (workflowIds) query = query.in("id", workflowIds);
    if (search) query = query.ilike("name", `%${search}%`);

    const { data, error, count } = await query;
    if (error) throw error;

    // Transform data to match expected format
    const workflows: WorkflowItem[] = (data || []).map(row => ({
      id: row.slug,
      name: row.name,
      path: row.path,
      rawUrl: row.raw_url,
      size: row.size_bytes || 0,
      updatedAt: row.updated_at,
      category: row.category,
      tags: row.workflow_tags?.map((wt: any) => wt.tags?.name).filter(Boolean) || [],
      nodeCount: row.node_count || 0,
      hasCredentials: row.has_credentials || false,
      complexity: row.complexity as WorkflowComplexity
    }));

    return { 
      data: workflows, 
      count: count ?? 0,
      total: count ?? 0,
      page,
      pageSize,
      hasMore: (page * pageSize) < (count || 0)
    };

  } catch (error) {
    console.error('Supabase query failed, falling back to static data:', error);
    
    // Fallback to static data on error
    const staticData = await loadStaticManifest();
    const filtered = filterStaticWorkflows(staticData, { query: search, tags: tagFilters });
    const sorted = sortStaticWorkflows(filtered, { field: 'updated_at', direction: 'desc' });
    
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    
    return {
      data: sorted.slice(from, to),
      total: sorted.length,
      page,
      pageSize,
      hasMore: to < sorted.length,
      count: sorted.length
    };
  }
}

export async function countWorkflowsByTags(tagFilters: string[]) {
  try {
    if (!tagFilters.length) {
      const { count } = await supabase.from("workflows").select("*", { count: "exact", head: true });
      return count ?? 0;
    }
    const { data: tagRows } = await supabase.from("tags").select("id").in("name", tagFilters);
    const tagIds = (tagRows ?? []).map(t => t.id);
    if (!tagIds.length) return 0;
    const { data: wtRows } = await supabase.from("workflow_tags").select("workflow_id").in("tag_id", tagIds).limit(100000);
    return new Set((wtRows ?? []).map(r => r.workflow_id)).size;
  } catch (error) {
    console.error('Failed to count workflows by tags:', error);
    return 0;
  }
}

export async function getWorkflowStats(): Promise<WorkflowStats> {
  try {
    const [workflowsResult, categoriesResult, tagsResult] = await Promise.all([
      supabase.from('workflows').select('complexity', { count: 'exact', head: true }),
      getCategories(),
      getTags()
    ]);

    const totalWorkflows = workflowsResult.count || 0;

    return {
      totalWorkflows,
      totalCategories: categoriesResult.length,
      totalIntegrations: tagsResult.length,
      averageSetupTime: 15 // Static estimate
    };
  } catch (error) {
    console.error('Failed to fetch workflow stats:', error);
    return {
      totalWorkflows: 0,
      totalCategories: 0,
      totalIntegrations: 0,
      averageSetupTime: 15
    };
  }
}

export async function fetchWorkflowRaw(rawUrl: string): Promise<N8nWorkflow> {
  const response = await fetch(rawUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch workflow: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!data.nodes || !Array.isArray(data.nodes)) {
    throw new Error('Invalid workflow format: missing nodes array');
  }
  
  return data;
}

// Static data fallback helpers
function filterStaticWorkflows(workflows: WorkflowManifest, filters: WorkflowFilters): WorkflowManifest {
  return workflows.filter(workflow => {
    if (filters.query) {
      const query = filters.query.toLowerCase();
      if (
        !workflow.name.toLowerCase().includes(query) &&
        !workflow.category.toLowerCase().includes(query) &&
        !workflow.tags.some(tag => tag.toLowerCase().includes(query))
      ) {
        return false;
      }
    }

    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(workflow.category)) {
        return false;
      }
    }

    if (filters.tags && filters.tags.length > 0) {
      if (!filters.tags.some(tag => workflow.tags.includes(tag))) {
        return false;
      }
    }

    if (filters.complexity && filters.complexity.length > 0) {
      if (!filters.complexity.includes(workflow.complexity)) {
        return false;
      }
    }

    if (filters.hasCredentials !== undefined) {
      if (workflow.hasCredentials !== filters.hasCredentials) {
        return false;
      }
    }

    return true;
  });
}

function sortStaticWorkflows(workflows: WorkflowManifest, sort: WorkflowSort): WorkflowManifest {
  return [...workflows].sort((a, b) => {
    let aVal: any, bVal: any;
    
    switch (sort.field) {
      case 'name':
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case 'node_count':
        aVal = a.nodeCount;
        bVal = b.nodeCount;
        break;
      case 'updated_at':
        aVal = new Date(a.updatedAt);
        bVal = new Date(b.updatedAt);
        break;
      case 'complexity':
        const complexityOrder = { 'Easy': 1, 'Medium': 2, 'Advanced': 3 };
        aVal = complexityOrder[a.complexity];
        bVal = complexityOrder[b.complexity];
        break;
      default:
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
    }
    
    if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
    return 0;
  });
}

// Legacy compatibility - keep for existing code
export async function loadManifest(): Promise<WorkflowManifest> {
  const result = await listWorkflows({ pageSize: 1000 });
  return result.data;
}
