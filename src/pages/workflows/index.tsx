import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Download, ChevronDown, Loader2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { listWorkflows, getCategories, getTags, getWorkflowStats, WorkflowSort } from '@/lib/workflows';
import { WorkflowItem, WorkflowStats, WorkflowComplexity } from '@/types/workflow';
import { WorkflowDownloadButton } from '@/components/WorkflowDownloadButton';

// Workflow card component
function WorkflowCard({ workflow, isSelected, onSelect }: { 
  workflow: WorkflowItem; 
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const complexityColors = {
    'Easy': 'bg-success/20 text-success border-success/30',
    'Medium': 'bg-warning/20 text-warning border-warning/30',
    'Advanced': 'bg-destructive/20 text-destructive border-destructive/30'
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(workflow.rawUrl);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${workflow.name.replace(/[^a-z0-9]/gi, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Downloaded ${workflow.name}`);
    } catch (error) {
      toast.error('Failed to download workflow');
      // Fallback: open in new tab
      window.open(workflow.rawUrl, '_blank');
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 border-border/50 bg-card">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(workflow.id)}
              className="border-border"
            />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg leading-tight text-foreground truncate">
                {workflow.name}
              </CardTitle>
              <p className="text-muted-foreground text-sm mt-1">{workflow.category}</p>
            </div>
          </div>
          <Badge className={`${complexityColors[workflow.complexity]} border shrink-0`}>
            {workflow.complexity}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nodes:</span>
            <span className="text-foreground font-medium">{workflow.nodeCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Credentials:</span>
            <span className={workflow.hasCredentials ? "text-warning" : "text-success"}>
              {workflow.hasCredentials ? "Required" : "None"}
            </span>
          </div>
        </div>

        {workflow.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {workflow.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs border-primary/20 text-primary">
                {tag}
              </Badge>
            ))}
            {workflow.tags.length > 3 && (
              <Badge variant="outline" className="text-xs border-muted text-muted-foreground">
                +{workflow.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link to={`/workflows/${workflow.id}`}>
              Preview
            </Link>
          </Button>
          <Button size="sm" onClick={handleDownload} className="flex-1">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading skeleton
function WorkflowCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-4 w-4" />
            <div className="flex-1">
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-8" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-14" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 flex-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function WorkflowBrowser() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State from URL params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category')?.split(',').filter(Boolean) || []
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get('tags')?.split(',').filter(Boolean) || []
  );
  const [selectedComplexity, setSelectedComplexity] = useState<WorkflowComplexity[]>(
    (searchParams.get('complexity')?.split(',').filter(Boolean) as WorkflowComplexity[]) || []
  );
  const [hasCredentials, setHasCredentials] = useState<boolean | undefined>(
    searchParams.get('credentials') === 'true' ? true : 
    searchParams.get('credentials') === 'false' ? false : undefined
  );
  const [sort, setSort] = useState<WorkflowSort>({
    field: (searchParams.get('sortBy') as any) || 'name',
    direction: (searchParams.get('sortDir') as any) || 'asc'
  });
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  
  // Data state
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [totalWorkflows, setTotalWorkflows] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [stats, setStats] = useState<WorkflowStats | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedWorkflows, setSelectedWorkflows] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  
  const pageSize = 50;

  // Load initial data (categories, tags, stats)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [categoriesData, tagsData, statsData] = await Promise.all([
          getCategories(),
          getTags(),
          getWorkflowStats()
        ]);
        
        setCategories(categoriesData);
        setTags(tagsData);
        setStats(statsData);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    };
    
    loadInitialData();
  }, []);

  // Load workflow data when filters change
  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await listWorkflows({
          query: searchTerm || undefined,
          categories: selectedCategories,
          tags: selectedTags,
          complexity: selectedComplexity,
          hasCredentials,
          sort,
          page: currentPage,
          pageSize
        });
        
        setWorkflows(result.data);
        setTotalWorkflows(result.total);
        setHasMore(result.hasMore);
      } catch (err) {
        console.error('Failed to load workflows:', err);
        setError('Failed to load workflows. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadWorkflows();
  }, [searchTerm, selectedCategories, selectedTags, selectedComplexity, hasCredentials, sort, currentPage]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (selectedCategories.length) params.set('category', selectedCategories.join(','));
    if (selectedTags.length) params.set('tags', selectedTags.join(','));
    if (selectedComplexity.length) params.set('complexity', selectedComplexity.join(','));
    if (hasCredentials !== undefined) params.set('credentials', hasCredentials.toString());
    if (sort.field !== 'name') params.set('sortBy', sort.field);
    if (sort.direction !== 'asc') params.set('sortDir', sort.direction);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    setSearchParams(params);
  }, [searchTerm, selectedCategories, selectedTags, selectedComplexity, hasCredentials, sort, currentPage, setSearchParams]);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedTags([]);
    setSelectedComplexity([]);
    setHasCredentials(undefined);
    setSort({ field: 'name', direction: 'asc' });
    setCurrentPage(1);
    setSelectedWorkflows(new Set());
  };

  // Handle bulk download
  const handleBulkDownload = async () => {
    if (selectedWorkflows.size === 0) {
      toast.error('No workflows selected');
      return;
    }

    if (selectedWorkflows.size > 200) {
      toast.error('Maximum 200 workflows can be downloaded at once');
      return;
    }

    try {
      setIsDownloading(true);
      toast.loading('Preparing download...', { id: 'bulk-download' });
      
      const response = await fetch('/api/workflows/zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedWorkflows) })
      });

      if (!response.ok) throw new Error('Bulk download failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `n8n-workflows-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Downloaded ${selectedWorkflows.size} workflows`, { id: 'bulk-download' });
      setSelectedWorkflows(new Set());
    } catch (error) {
      toast.error('Bulk download failed', { id: 'bulk-download' });
    } finally {
      setIsDownloading(false);
    }
  };

  // Toggle workflow selection
  const toggleWorkflowSelection = (id: string) => {
    setSelectedWorkflows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedWorkflows.size === workflows.length) {
      setSelectedWorkflows(new Set());
    } else {
      setSelectedWorkflows(new Set(workflows.map(w => w.id)));
    }
  };

  if (error) {
    return (
      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-foreground mb-4">Failed to Load Workflows</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link to="/projects">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">n8n Workflow Library</h1>
          <p className="text-xl text-muted-foreground">
            Discover and download production-ready automation workflows for your business needs.
          </p>
        </div>

        {/* Stats */}
        {stats && !loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalWorkflows.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Workflows</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalCategories}</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalIntegrations}</div>
                <div className="text-sm text-muted-foreground">Integrations</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.averageSetupTime}m</div>
                <div className="text-sm text-muted-foreground">Avg Setup Time</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search workflows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
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

              {/* Complexity Filter */}
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

              {/* Sort */}
              <Select 
                value={`${sort.field}_${sort.direction}`} 
                onValueChange={(value) => {
                  const [field, dir] = value.split('_');
                  setSort({ field: field as any, direction: dir as any });
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
                  <SelectItem value="complexity_asc">Complexity (Easy to Hard)</SelectItem>
                  <SelectItem value="complexity_desc">Complexity (Hard to Easy)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {totalWorkflows.toLocaleString()} workflows found
                </span>
                {(searchTerm || selectedCategories.length > 0 || selectedComplexity.length > 0) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <Filter className="h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {workflows.length > 0 && (
                  <>
                    <Checkbox
                      checked={selectedWorkflows.size === workflows.length}
                      onCheckedChange={toggleSelectAll}
                    />
                    <span className="text-sm text-muted-foreground">
                      Select All
                    </span>
                  </>
                )}
                
                {selectedWorkflows.size > 0 && (
                  <Button 
                    size="sm" 
                    onClick={handleBulkDownload}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Download {selectedWorkflows.size} Selected
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflows Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <WorkflowCardSkeleton key={i} />
            ))}
          </div>
        ) : workflows.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {workflows.map(workflow => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  isSelected={selectedWorkflows.has(workflow.id)}
                  onSelect={toggleWorkflowSelection}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center">
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <span className="text-sm text-muted-foreground">
                Page {currentPage}
              </span>
              
              <Button 
                variant="outline"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={!hasMore}
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-foreground mb-2">No workflows found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or clearing filters.
            </p>
            <Button onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}