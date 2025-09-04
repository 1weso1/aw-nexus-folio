import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Download, Eye, User, AlertCircle, Workflow, Calendar, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WorkflowType {
  id: string;
  name: string;
  category: string;
  node_count: number;
  has_credentials: boolean;
  complexity: string;
  created_at: string;
  size_bytes: number;
  slug: string;
}

const Workflows = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [complexityFilter, setComplexityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const categories = [
    'all', 'Communication', 'Data Processing', 'Marketing', 'Sales', 'Productivity', 
    'Social Media', 'E-commerce', 'Analytics', 'Finance', 'General'
  ];

  const complexities = ['all', 'Easy', 'Medium', 'Hard'];

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      let query = supabase
        .from('workflows')
        .select('id, name, category, node_count, has_credentials, complexity, created_at, size_bytes, slug')
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching workflows:', error);
        toast.error('Failed to load workflows');
        return;
      }

      setWorkflows(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || workflow.category === categoryFilter;
    const matchesComplexity = complexityFilter === 'all' || workflow.complexity === complexityFilter;
    
    return matchesSearch && matchesCategory && matchesComplexity;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      case 'complexity':
        const complexityOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
        return (complexityOrder[a.complexity as keyof typeof complexityOrder] || 0) - 
               (complexityOrder[b.complexity as keyof typeof complexityOrder] || 0);
      case 'nodes':
        return b.node_count - a.node_count;
      default:
        return 0;
    }
  });

  const getComplexityColor = (complexity: string) => {
    switch (complexity?.toLowerCase()) {
      case 'easy': return "bg-green-500/20 text-green-400 border-green-500/30";
      case 'medium': return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case 'hard': return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleAuthRequired = () => {
    toast.error('Please sign in to download workflows');
    navigate('/automation/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
            <div className="h-16 bg-muted rounded mb-8"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Workflow Library
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Discover and download professional n8n automation workflows. 
            {!user && (
              <span className="text-primary"> Sign in to unlock downloads and premium features.</span>
            )}
          </p>
        </div>

        {/* Filters */}
        <Card className="glass border-primary/20 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search workflows..."
                  className="pl-10 glass border-primary/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="glass border-primary/20">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={complexityFilter} onValueChange={setComplexityFilter}>
              <SelectTrigger className="glass border-primary/20">
                <SelectValue placeholder="Complexity" />
              </SelectTrigger>
              <SelectContent>
                {complexities.map(complexity => (
                  <SelectItem key={complexity} value={complexity}>
                    {complexity === 'all' ? 'All Levels' : complexity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="glass border-primary/20">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="complexity">Complexity</SelectItem>
                <SelectItem value="nodes">Node Count</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-primary/20">
            <p className="text-sm text-muted-foreground">
              Showing {filteredWorkflows.length} of {workflows.length} workflows
            </p>
            {!user && (
              <Button variant="outline" className="glass border-primary/20" onClick={() => navigate('/automation/auth')}>
                <User className="mr-2 h-4 w-4" />
                Sign In for Downloads
              </Button>
            )}
          </div>
        </Card>

        {/* Workflows Grid */}
        {filteredWorkflows.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkflows.map((workflow) => (
              <Card key={workflow.id} className="glass border-primary/20 p-6 hover-lift">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                      {workflow.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="border-primary/30">
                        {workflow.category}
                      </Badge>
                      <Badge className={getComplexityColor(workflow.complexity)}>
                        {workflow.complexity}
                      </Badge>
                    </div>
                  </div>
                  {workflow.has_credentials && (
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  )}
                </div>

                <div className="space-y-2 mb-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Workflow className="w-4 h-4" />
                    <span>{workflow.node_count} nodes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span>{formatFileSize(workflow.size_bytes || 0)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(workflow.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1 glass border-primary/20" asChild>
                    <Link to={`/automation/workflows/${workflow.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </Button>
                  
                  {user ? (
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      asChild
                    >
                      <Link to={`/automation/workflows/${workflow.id}`}>
                        <Download className="h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      onClick={handleAuthRequired}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass border-primary/20 p-12 text-center">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              No workflows found
            </h2>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <Button 
              variant="outline" 
              className="glass border-primary/20"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setComplexityFilter('all');
                setSortBy('newest');
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Workflows;