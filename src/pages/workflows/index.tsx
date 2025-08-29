import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { WorkflowCard } from '@/components/WorkflowCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkflowSync } from '@/hooks/useWorkflowSync';
import { 
  Search, 
  Filter, 
  Download, 
  BarChart3,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  listWorkflows, 
  getCategories, 
  getTags, 
  getWorkflowStats 
} from '@/lib/workflows';
import { WorkflowItem, WorkflowStats, WorkflowComplexity } from '@/types/workflow';
import { WorkflowSort } from '@/lib/workflows';

// Skeleton component for loading state
const WorkflowCardSkeleton: React.FC = () => (
  <div className="space-y-3">
    <Skeleton className="h-32 w-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

const WorkflowBrowser: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isSyncing, syncResult, triggerSync, checkAndAutoSync } = useWorkflowSync();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('categories')?.split(',').filter(Boolean) || []
  );
  const [selectedComplexity, setSelectedComplexity] = useState<WorkflowComplexity[]>(
    (searchParams.get('complexity')?.split(',') as WorkflowComplexity[]) || []
  );
  const [requiresCredentials, setRequiresCredentials] = useState<boolean | undefined>(
    searchParams.get('credentials') === 'true' ? true : 
    searchParams.get('credentials') === 'false' ? false : undefined
  );
  const [sortBy, setSortBy] = useState<WorkflowSort>(
    {
      field: (searchParams.get('sortBy') as any) || 'name',
      direction: (searchParams.get('sortDir') as 'asc' | 'desc') || 'asc'
    }
  );
  
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [stats, setStats] = useState<WorkflowStats>({
    totalWorkflows: 0,
    totalCategories: 0,
    totalIntegrations: 0,
    averageSetupTime: 0
  });
  const [selectedWorkflows, setSelectedWorkflows] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalWorkflows, setTotalWorkflows] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const pageSize = 24;

  // Auto-sync on first load
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      
      try {
        // Check if database is populated, auto-sync if empty
        await checkAndAutoSync();
        
        const [categoriesData, tagsData, statsData] = await Promise.all([
          getCategories(),
          getTags(),
          getWorkflowStats()
        ]);
        
        setCategories(categoriesData);
        setTags(tagsData);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to initialize data:', error);
        toast.error('Failed to load workflow data');
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, [checkAndAutoSync]);

  // Load workflows when filters change
  useEffect(() => {
    const loadWorkflows = async () => {
      setLoading(true);
      
      try {
        const result = await listWorkflows({
          query: searchTerm || undefined,
          categories: selectedCategories,
          complexity: selectedComplexity,
          hasCredentials: requiresCredentials,
          sort: sortBy,
          page,
          pageSize
        });
        
        setWorkflows(result.data);
        setTotalWorkflows(result.total);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error('Failed to load workflows:', error);
        toast.error('Failed to load workflows');
      } finally {
        setLoading(false);
      }
    };
    
    if (!loading) {
      loadWorkflows();
    }
  }, [searchTerm, selectedCategories, selectedComplexity, requiresCredentials, sortBy, page, loading]);

  // Update URL parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategories.length) params.set('categories', selectedCategories.join(','));
    if (selectedComplexity.length) params.set('complexity', selectedComplexity.join(','));
    if (requiresCredentials !== undefined) params.set('credentials', String(requiresCredentials));
    if (sortBy.field !== 'name') params.set('sortBy', sortBy.field);
    if (sortBy.direction !== 'asc') params.set('sortDir', sortBy.direction);
    if (page > 1) params.set('page', String(page));
    
    setSearchParams(params);
  }, [searchTerm, selectedCategories, selectedComplexity, requiresCredentials, sortBy, page, setSearchParams]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedComplexity([]);
    setRequiresCredentials(undefined);
    setSortBy({ field: 'name', direction: 'asc' });
    setPage(1);
  };

  const handleBulkDownload = async () => {
    if (selectedWorkflows.size === 0) {
      toast.error('No workflows selected');
      return;
    }

    try {
      const selectedIds = Array.from(selectedWorkflows);

      const response = await fetch('/api/workflows/zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowIds: selectedIds
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create ZIP file');
      }

      // Create download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `n8n-workflows-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Downloaded ${selectedWorkflows.size} workflows as ZIP`);
    } catch (error) {
      console.error('Bulk download failed:', error);
      toast.error('Failed to download workflows');
    }
  };

  const toggleWorkflowSelection = (workflowId: string, selected: boolean) => {
    const newSelected = new Set(selectedWorkflows);
    if (selected) {
      newSelected.add(workflowId);
    } else {
      newSelected.delete(workflowId);
    }
    setSelectedWorkflows(newSelected);
  };

  const handleWorkflowPreview = (slug: string) => {
    navigate(`/workflows/${slug}`);
  };

  const toggleSelectAll = () => {
    if (selectedWorkflows.size === workflows.length) {
      setSelectedWorkflows(new Set());
    } else {
      setSelectedWorkflows(new Set(workflows.map(w => w.id)));
    }
  };

  return (
    <div className="min-h-screen bg-bg-hero text-text-high">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-high">
                n8n Workflow Library
              </h1>
              <p className="text-text-mid mt-2">
                Discover and download ready-to-use n8n workflows from the community
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={triggerSync} 
              disabled={isSyncing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Workflows'}
            </Button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-bg-card rounded-lg p-4 border border-border-subtle">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-brand-primary" />
                <div>
                  <p className="text-sm font-semibold text-text-high">{stats.totalWorkflows.toLocaleString()}</p>
                  <p className="text-xs text-text-mid">Workflows</p>
                </div>
              </div>
            </div>
            <div className="bg-bg-card rounded-lg p-4 border border-border-subtle">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-brand-primary" />
                <div>
                  <p className="text-sm font-semibold text-text-high">{stats.totalCategories}</p>
                  <p className="text-xs text-text-mid">Categories</p>
                </div>
              </div>
            </div>
            <div className="bg-bg-card rounded-lg p-4 border border-border-subtle">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-brand-primary" />
                <div>
                  <p className="text-sm font-semibold text-text-high">{stats.totalIntegrations}</p>
                  <p className="text-xs text-text-mid">Tags</p>
                </div>
              </div>
            </div>
            <div className="bg-bg-card rounded-lg p-4 border border-border-subtle">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-brand-primary" />
                <div>
                  <p className="text-sm font-semibold text-text-high">{selectedWorkflows.size}</p>
                  <p className="text-xs text-text-mid">Selected</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-bg-card rounded-lg p-6 mb-6 border border-border-subtle">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-mid" />
              <Input
                placeholder="Search workflows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select 
              value={selectedCategories[0] || ''} 
              onValueChange={(value) => setSelectedCategories(value ? [value] : [])}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={selectedComplexity[0] || ''} 
              onValueChange={(value) => setSelectedComplexity(value ? [value as WorkflowComplexity] : [])}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Complexity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Complexity</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={`${sortBy.field}_${sortBy.direction}`} 
              onValueChange={(value) => {
                const [field, dir] = value.split('_');
                setSortBy({ field: field as any, direction: dir as any });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name_asc">Name A-Z</SelectItem>
                <SelectItem value="name_desc">Name Z-A</SelectItem>
                <SelectItem value="node_count_asc">Nodes (Low to High)</SelectItem>
                <SelectItem value="node_count_desc">Nodes (High to Low)</SelectItem>
                <SelectItem value="updated_at_desc">Recently Updated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-sm text-text-mid">
                {totalWorkflows} workflows found
              </p>
              {(searchTerm || selectedCategories.length > 0 || selectedComplexity.length > 0) && (
                <Button variant="ghost" onClick={clearFilters} size="sm">
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {selectedWorkflows.size > 0 && (
                <>
                  <Button onClick={toggleSelectAll} variant="outline" size="sm">
                    {selectedWorkflows.size === workflows.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button onClick={handleBulkDownload} variant="default" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Selected ({selectedWorkflows.size})
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Workflows Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: pageSize }).map((_, index) => (
              <WorkflowCardSkeleton key={index} />
            ))}
          </div>
        ) : workflows.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-text-mid text-lg mb-4">No workflows found</div>
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {workflows.map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                isSelected={selectedWorkflows.has(workflow.id)}
                onSelect={toggleWorkflowSelection}
                onPreview={handleWorkflowPreview}
                showSelect={true}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalWorkflows > pageSize && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-mid">
                Page {page} of {Math.ceil(totalWorkflows / pageSize)}
              </span>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={!hasMore}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowBrowser;