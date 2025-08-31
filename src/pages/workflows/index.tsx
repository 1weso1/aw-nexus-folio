import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Download, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { listWorkflowsBasic } from '@/lib/workflows';

// Skeleton component for loading state
const WorkflowCardSkeleton: React.FC = () => (
  <Card className="bg-bg-card border-text-mid/20">
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-8 w-24" />
      </div>
    </CardContent>
  </Card>
);

const WorkflowsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [total, setTotal] = useState(0);
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);
  
  const pageSize = 24;
  const totalPages = Math.ceil(total / pageSize);

  // Load workflows
  const loadWorkflows = async (currentPage: number, search: string) => {
    console.log('loadWorkflows called:', { currentPage, search });
    setLoading(true);
    setError(null);
    try {
      console.log('About to call listWorkflowsBasic...');
      const result = await listWorkflowsBasic(currentPage, pageSize, search);
      console.log('listWorkflowsBasic returned:', { 
        itemsLength: result.items.length, 
        total: result.total, 
        hasError: !!result.error 
      });
      
      if (result.error) {
        console.error('Setting error:', result.error.message);
        setError(result.error.message || 'Unknown error occurred');
        setWorkflows([]);
        setTotal(0);
      } else {
        console.log('Setting workflows:', result.items.slice(0, 2)); // Log first 2 items
        setWorkflows(result.items);
        setTotal(result.total);
      }
    } catch (error) {
      console.error('Failed to load workflows - caught exception:', error);
      setError(error instanceof Error ? error.message : 'Failed to load workflows');
      setWorkflows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Load workflows on page/search change
  useEffect(() => {
    loadWorkflows(page, searchTerm);
  }, [page]);

  // Debounced search
  useEffect(() => {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }
    
    const timeout = setTimeout(() => {
      setPage(1); // Reset to first page on search
      loadWorkflows(1, searchTerm);
    }, 300);
    
    setSearchDebounce(timeout);
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchTerm]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (page > 1) params.set('page', page.toString());
    setSearchParams(params);
  }, [searchTerm, page, setSearchParams]);

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handleDownload = (rawUrl: string, name: string) => {
    const link = document.createElement('a');
    link.href = rawUrl;
    link.download = `${name}.json`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-bg-hero text-text-high">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-text-high">
            n8n Workflows
          </h1>
          <p className="text-text-mid mb-6">
            Browse and download ready-to-use automation workflows
          </p>
          
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-mid h-4 w-4" />
            <Input
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-bg-card border-text-mid/20 text-text-high"
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-500/20 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-500">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        {!loading && !error && (
          <div className="mb-6 text-text-mid">
            Showing {workflows.length} of {total} workflows
            {searchTerm && ` for "${searchTerm}"`}
          </div>
        )}

        {/* Workflows Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: pageSize }).map((_, index) => (
              <WorkflowCardSkeleton key={index} />
            ))}
          </div>
        ) : workflows.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-mid text-lg mb-4">
              {searchTerm ? `No workflows found for "${searchTerm}"` : 'No workflows found'}
            </p>
            {searchTerm && (
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm('')}
                className="border-text-mid/20 text-text-mid hover:bg-bg-card"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="bg-bg-card border-text-mid/20 hover:border-brand-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-text-high text-lg line-clamp-2">
                    {workflow.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {workflow.category}
                    </Badge>
                    <span className="text-text-mid text-sm">
                      {workflow.node_count} nodes
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-text-mid text-sm">
                      Updated {new Date(workflow.updated_at).toLocaleDateString()}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(workflow.raw_url, workflow.name)}
                      className="border-brand-primary/50 text-brand-primary hover:bg-brand-primary/10"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      JSON
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <Button
              variant="outline"
              onClick={handlePrevPage}
              disabled={page === 1}
              className="border-text-mid/20 text-text-mid hover:bg-bg-card disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <span className="text-text-mid">
              Page {page} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={page === totalPages}
              className="border-text-mid/20 text-text-mid hover:bg-bg-card disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowsPage;