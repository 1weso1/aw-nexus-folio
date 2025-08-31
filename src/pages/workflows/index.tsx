import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Filter, Download, Eye, ArrowUpDown, Loader2, AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { loadManifest, searchWorkflows, filterByCategory, filterByTags, filterByComplexity, filterByCredentials, sortWorkflows, getCategories, getTags, getWorkflowStats } from "@/lib/workflows";
import { PAGE_SIZE } from "@/config/workflows";
import type { WorkflowManifest, WorkflowItem, WorkflowStats } from "@/types/workflow";

// Virtualized workflow card component
function WorkflowCard({ workflow, isSelected, onSelect }: { 
  workflow: WorkflowItem; 
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const complexityColors = {
    'Easy': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Advanced': 'bg-red-500/20 text-red-400 border-red-500/30'
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
    <div className="glass rounded-xl p-6 hover-lift hover-glow border border-neon-primary/10">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(workflow.id)}
            className="border-neon-primary/30"
          />
          <div>
            <h3 className="font-semibold text-text-primary text-lg leading-tight">{workflow.name}</h3>
            <p className="text-text-secondary text-sm mt-1">{workflow.category}</p>
          </div>
        </div>
        <Badge className={`${complexityColors[workflow.complexity]} border`}>
          {workflow.complexity}
        </Badge>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Nodes:</span>
          <span className="text-text-primary font-medium">{workflow.nodeCount}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Credentials:</span>
          <span className={workflow.hasCredentials ? "text-yellow-400" : "text-green-400"}>
            {workflow.hasCredentials ? "Required" : "None"}
          </span>
        </div>
      </div>

      {workflow.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {workflow.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs border-neon-primary/20 text-neon-primary">
              {tag}
            </Badge>
          ))}
          {workflow.tags.length > 3 && (
            <Badge variant="outline" className="text-xs border-neon-primary/20 text-text-secondary">
              +{workflow.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <Button asChild size="sm" variant="outline" className="flex-1">
          <Link to={`/workflows/${workflow.id}`}>
            <Eye className="h-4 w-4" />
            Preview
          </Link>
        </Button>
        <Button size="sm" variant="neon" onClick={handleDownload} className="flex-1">
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>
    </div>
  );
}

// Loading skeleton
function WorkflowCardSkeleton() {
  return (
    <div className="glass rounded-xl p-6 border border-neon-primary/10">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-4" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-8" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
      
      <div className="flex gap-1 mb-4">
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-14" />
      </div>
      
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
    </div>
  );
}

export default function WorkflowBrowser() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [workflows, setWorkflows] = useState<WorkflowManifest>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<WorkflowStats | null>(null);
  
  // Filters from URL params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category')?.split(',').filter(Boolean) || []
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get('tags')?.split(',').filter(Boolean) || []
  );
  const [selectedComplexities, setSelectedComplexities] = useState<string[]>(
    searchParams.get('complexity')?.split(',').filter(Boolean) || []
  );
  const [credentialsFilter, setCredentialsFilter] = useState<boolean | undefined>(
    searchParams.get('credentials') === 'true' ? true : 
    searchParams.get('credentials') === 'false' ? false : undefined
  );
  const [sortBy, setSortBy] = useState<'name' | 'nodeCount' | 'updatedAt' | 'complexity'>(
    (searchParams.get('sort') as any) || 'name'
  );
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    (searchParams.get('sortDir') as any) || 'asc'
  );
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([]);

  // Load workflows
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const manifest = await loadManifest();
        setWorkflows(manifest);
        setStats(getWorkflowStats(manifest));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load workflows');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategories.length > 0) params.set('category', selectedCategories.join(','));
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    if (selectedComplexities.length > 0) params.set('complexity', selectedComplexities.join(','));
    if (credentialsFilter !== undefined) params.set('credentials', credentialsFilter.toString());
    if (sortBy !== 'name') params.set('sort', sortBy);
    if (sortDirection !== 'asc') params.set('sortDir', sortDirection);
    if (currentPage !== 1) params.set('page', currentPage.toString());
    
    setSearchParams(params);
  }, [searchTerm, selectedCategories, selectedTags, selectedComplexities, credentialsFilter, sortBy, sortDirection, currentPage, setSearchParams]);

  // Filter and sort workflows
  const filteredAndSortedWorkflows = useMemo(() => {
    let result = workflows;
    
    // Apply search
    if (searchTerm) {
      result = searchWorkflows(result, searchTerm);
    }
    
    // Apply filters
    result = filterByCategory(result, selectedCategories);
    result = filterByTags(result, selectedTags);
    result = filterByComplexity(result, selectedComplexities);
    result = filterByCredentials(result, credentialsFilter);
    
    // Apply sorting
    result = sortWorkflows(result, sortBy, sortDirection);
    
    return result;
  }, [workflows, searchTerm, selectedCategories, selectedTags, selectedComplexities, credentialsFilter, sortBy, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedWorkflows.length / PAGE_SIZE);
  const paginatedWorkflows = filteredAndSortedWorkflows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Get available options for filters
  const availableCategories = getCategories(workflows);
  const availableTags = getTags(workflows);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedTags([]);
    setSelectedComplexities([]);
    setCredentialsFilter(undefined);
    setSortBy('name');
    setSortDirection('asc');
    setCurrentPage(1);
  };

  // Handle bulk download
  const handleBulkDownload = async () => {
    if (selectedWorkflows.length === 0) {
      toast.error('No workflows selected');
      return;
    }

    if (selectedWorkflows.length > 200) {
      toast.error('Maximum 200 workflows can be downloaded at once');
      return;
    }

    try {
      toast.loading('Preparing download...', { id: 'bulk-download' });
      
      const response = await fetch('/api/workflows/zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ids: selectedWorkflows,
          workflows: workflows.filter(w => selectedWorkflows.includes(w.id))
        })
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

      toast.success(`Downloaded ${selectedWorkflows.length} workflows`, { id: 'bulk-download' });
      setSelectedWorkflows([]);
    } catch (error) {
      toast.error('Bulk download failed', { id: 'bulk-download' });
    }
  };

  // Select/deselect workflow
  const toggleWorkflowSelection = (id: string) => {
    setSelectedWorkflows(prev => 
      prev.includes(id) 
        ? prev.filter(wId => wId !== id)
        : [...prev, id]
    );
  };

  // Select all/none
  const toggleSelectAll = () => {
    if (selectedWorkflows.length === paginatedWorkflows.length) {
      setSelectedWorkflows([]);
    } else {
      setSelectedWorkflows(paginatedWorkflows.map(w => w.id));
    }
  };

  if (error) {
    return (
      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-4">Failed to Load Workflows</h1>
          <p className="text-text-secondary mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} variant="neon">
            <RefreshCcw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="hero-text text-4xl md:text-5xl mb-4">n8n Workflow Library</h1>
          <p className="body-large">
            Discover and download production-ready automation workflows for your business needs.
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-2xl font-bold neon-text">{stats.totalWorkflows.toLocaleString()}</div>
              <div className="text-sm text-text-secondary">Total Workflows</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-2xl font-bold neon-text">{stats.totalCategories}</div>
              <div className="text-sm text-text-secondary">Categories</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-2xl font-bold neon-text">{stats.totalIntegrations}</div>
              <div className="text-sm text-text-secondary">Integrations</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-2xl font-bold neon-text">{stats.averageSetupTime}m</div>
              <div className="text-sm text-text-secondary">Avg Setup Time</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="glass rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <Input
                placeholder="Search workflows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategories[0] || ''} onValueChange={(value) => setSelectedCategories(value ? [value] : [])}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {availableCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Complexity Filter */}
            <Select value={selectedComplexities[0] || ''} onValueChange={(value) => setSelectedComplexities(value ? [value] : [])}>
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
            <Select value={`${sortBy}_${sortDirection}`} onValueChange={(value) => {
              const [sort, dir] = value.split('_');
              setSortBy(sort as any);
              setSortDirection(dir as any);
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name_asc">Name A-Z</SelectItem>
                <SelectItem value="name_desc">Name Z-A</SelectItem>
                <SelectItem value="nodeCount_asc">Nodes (Low to High)</SelectItem>
                <SelectItem value="nodeCount_desc">Nodes (High to Low)</SelectItem>
                <SelectItem value="complexity_asc">Complexity (Easy to Hard)</SelectItem>
                <SelectItem value="complexity_desc">Complexity (Hard to Easy)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-text-secondary">
                {filteredAndSortedWorkflows.length.toLocaleString()} workflows found
              </span>
              {(searchTerm || selectedCategories.length > 0 || selectedComplexities.length > 0) && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <Filter className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>

            {selectedWorkflows.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">
                  {selectedWorkflows.length} selected
                </span>
                <Button size="sm" variant="neon" onClick={handleBulkDownload}>
                  <Download className="h-4 w-4" />
                  Download ZIP ({selectedWorkflows.length})
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <WorkflowCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredAndSortedWorkflows.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">No workflows found</h3>
            <p className="text-text-secondary mb-4">
              Try adjusting your search terms or filters.
            </p>
            <Button onClick={clearFilters} variant="neon">
              Clear All Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedWorkflows.length === paginatedWorkflows.length && paginatedWorkflows.length > 0}
                  onCheckedChange={toggleSelectAll}
                  className="border-neon-primary/30"
                />
                <span className="text-sm text-text-secondary">Select All</span>
              </div>
              
              <div className="text-sm text-text-secondary">
                Page {currentPage} of {totalPages}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedWorkflows.map(workflow => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  isSelected={selectedWorkflows.includes(workflow.id)}
                  onSelect={toggleWorkflowSelection}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5) {
                      if (currentPage > 3) {
                        pageNum = currentPage - 2 + i;
                      }
                      if (pageNum > totalPages) {
                        pageNum = totalPages - 4 + i;
                      }
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "neon" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}