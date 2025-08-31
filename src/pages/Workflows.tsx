import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Search, Shield, ShieldCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Workflow {
  id: string;
  name: string;
  category: string;
  node_count: number;
  has_credentials: boolean;
  raw_url: string;
  complexity: string;
}

const Workflows = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchWorkflows();
  }, []);

  useEffect(() => {
    const filtered = workflows.filter(workflow =>
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredWorkflows(filtered);
    setCurrentPage(1);
  }, [searchTerm, workflows]);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch(
        `https://ugjeubqwmgnqvohmrkyv.supabase.co/rest/v1/workflows?select=id,name,category,node_count,has_credentials,raw_url,complexity&order=name.asc`,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnamV1YnF3bWducXZvaG1ya3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0Nzc5NDEsImV4cCI6MjA3MjA1Mzk0MX0.esXYyxM-eQbKBXhG2NKrzLsdiveNo4lBsK_rlv_ebjo',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnamV1YnF3bWducXZvaG1ya3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0Nzc5NDEsImV4cCI6MjA3MjA1Mzk0MX0.esXYyxM-eQbKBXhG2NKrzLsdiveNo4lBsK_rlv_ebjo`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch workflows');
      
      const data = await response.json();
      setWorkflows(data || []);
      setFilteredWorkflows(data || []);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast({
        title: "Error",
        description: "Failed to load workflows",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadWorkflow = async (workflow: Workflow) => {
    try {
      const response = await fetch(workflow.raw_url);
      if (!response.ok) throw new Error('Failed to fetch workflow');
      
      const workflowData = await response.json();
      const blob = new Blob([JSON.stringify(workflowData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${workflow.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: `Downloaded ${workflow.name}`,
      });
    } catch (error) {
      console.error('Error downloading workflow:', error);
      toast({
        title: "Error",
        description: "Failed to download workflow",
        variant: "destructive",
      });
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity?.toLowerCase()) {
      case 'easy':
        return 'bg-green-400/20 text-green-300 border-green-400/30';
      case 'medium':
        return 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30';
      case 'hard':
        return 'bg-red-400/20 text-red-300 border-red-400/30';
      default:
        return 'bg-neon-primary/20 text-neon-primary border-neon-primary/30';
    }
  };

  const paginatedWorkflows = filteredWorkflows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredWorkflows.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="glass rounded-2xl p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-neon-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-text-primary text-lg">Loading workflows...</p>
          <p className="text-text-secondary text-sm mt-2">Fetching automation library from Supabase</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="hero-text text-4xl md:text-5xl mb-6">n8n Workflows</h1>
          <p className="body-large mb-8 max-w-3xl">
            Browse and download automation workflows from the 1weso1/n8n-workflows repository. 
            Each workflow is production-ready and includes detailed integration information.
          </p>
          
          <div className="relative mb-8 max-w-xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search workflows by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 glass border-neon-primary/20 focus:border-neon-primary/50 bg-surface-card/50"
            />
          </div>

          <div className="flex flex-wrap gap-6 mb-8 text-sm">
            <div className="glass px-4 py-2 rounded-lg">
              <span className="text-text-secondary">Total workflows:</span>
              <span className="ml-2 text-neon-primary font-semibold">{workflows.length}</span>
            </div>
            <div className="glass px-4 py-2 rounded-lg">
              <span className="text-text-secondary">Showing:</span>
              <span className="ml-2 text-neon-primary font-semibold">{filteredWorkflows.length}</span>
            </div>
            {searchTerm && (
              <div className="glass px-4 py-2 rounded-lg">
                <span className="text-text-secondary">Search:</span>
                <span className="ml-2 text-neon-primary font-semibold">"{searchTerm}"</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {paginatedWorkflows.map((workflow) => (
            <div key={workflow.id} className="project-card hover-lift hover-glow">
              <div className="flex justify-between items-start gap-3 mb-4">
                <h3 className="text-text-primary text-lg font-semibold font-sora line-clamp-2 flex-1">
                  {workflow.name}
                </h3>
                <Badge className={getComplexityColor(workflow.complexity)}>
                  {workflow.complexity}
                </Badge>
              </div>
              
              <p className="text-text-secondary text-sm mb-4 capitalize">
                {workflow.category}
              </p>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-neon-primary rounded-full"></span>
                    {workflow.node_count} nodes
                  </span>
                  <div className="flex items-center gap-1">
                    {workflow.has_credentials ? (
                      <Shield className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-green-400" />
                    )}
                    <span>{workflow.has_credentials ? 'Auth Required' : 'No Auth'}</span>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => downloadWorkflow(workflow)}
                className="w-full gradient-primary hover:shadow-lg transition-all duration-300"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download JSON
              </Button>
            </div>
          ))}
        </div>

        {filteredWorkflows.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="glass rounded-2xl p-12 max-w-md mx-auto">
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-text-primary text-xl font-semibold mb-2">No workflows found</h3>
              <p className="text-text-secondary mb-4">
                {searchTerm ? `No workflows match "${searchTerm}"` : 'No workflows available'}
              </p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                  className="border-neon-primary/30 text-neon-primary hover:bg-neon-primary/10"
                >
                  Clear search
                </Button>
              )}
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mb-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="border-neon-primary/30 text-neon-primary hover:bg-neon-primary/10"
            >
              Previous
            </Button>
            <div className="glass px-4 py-2 rounded-lg">
              <span className="text-text-secondary">Page</span>
              <span className="mx-2 text-neon-primary font-semibold">{currentPage}</span>
              <span className="text-text-secondary">of {totalPages}</span>
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="border-neon-primary/30 text-neon-primary hover:bg-neon-primary/10"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workflows;