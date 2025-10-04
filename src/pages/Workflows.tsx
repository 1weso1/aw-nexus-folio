import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Search, Shield, ShieldCheck, Filter, X, Eye, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Workflow {
  id: string;
  name: string;
  category: string;
  node_count: number;
  has_credentials: boolean;
  raw_url: string;
  complexity: string;
  size_bytes?: number;
}

const Workflows = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [complexityFilter, setComplexityFilter] = useState('all');
  const [credentialsFilter, setCredentialsFilter] = useState('all');
  const [nodeCountFilter, setNodeCountFilter] = useState('all');
  const [triggerTypeFilter, setTriggerTypeFilter] = useState('all');
  const [fileSizeFilter, setFileSizeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [useSemanticSearch, setUseSemanticSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [semanticResults, setSemanticResults] = useState<any[]>([]);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  // Semantic search handler
  const performSemanticSearch = async (query: string) => {
    if (!query.trim()) {
      setSemanticResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('semantic-search', {
        body: { query, limit: 50 }
      });

      if (error) throw error;

      if (data?.success && data?.results) {
        setSemanticResults(data.results);
      } else {
        throw new Error('No results from semantic search');
      }
    } catch (error) {
      console.error('Semantic search error:', error);
      toast({
        title: "Semantic Search Unavailable",
        description: "Falling back to text search. Try generating embeddings first.",
        variant: "default",
      });
      setUseSemanticSearch(false);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (useSemanticSearch && searchTerm) {
      performSemanticSearch(searchTerm);
    }
  }, [searchTerm, useSemanticSearch]);

  useEffect(() => {
    let filtered = workflows.filter(workflow => {
      // If semantic search is active and has results, filter by those IDs
      if (useSemanticSearch && semanticResults.length > 0) {
        const semanticIds = new Set(semanticResults.map(r => r.workflow_id));
        if (!semanticIds.has(workflow.id)) {
          return false;
        }
      }

      // Search filter - enhanced with service detection
      const serviceCategory = getServiceCategory(workflow);
      const triggerType = getTriggerType(workflow);
      const enhancedComplexity = getEnhancedComplexity(workflow.node_count);
      
      const matchesSearch = useSemanticSearch || 
                           workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           workflow.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           serviceCategory.includes(searchTerm.toLowerCase());
      
      // Category filter
      const matchesCategory = categoryFilter === 'all' || 
                             workflow.category.toLowerCase() === categoryFilter.toLowerCase();
      
      // Service filter
      const matchesService = serviceFilter === 'all' || serviceCategory === serviceFilter;
      
      // Trigger type filter
      const matchesTrigger = triggerTypeFilter === 'all' || triggerType === triggerTypeFilter;
      
      // Complexity filter - enhanced with granular levels
      const matchesComplexity = complexityFilter === 'all' || 
                               (complexityFilter === 'starter' && enhancedComplexity === 'starter') ||
                               (complexityFilter === 'basic' && enhancedComplexity === 'basic') ||
                               (complexityFilter === 'intermediate' && enhancedComplexity === 'intermediate') ||  
                               (complexityFilter === 'advanced' && enhancedComplexity === 'advanced') ||
                               (complexityFilter === 'expert' && enhancedComplexity === 'expert') ||
                               (complexityFilter === 'enterprise' && enhancedComplexity === 'enterprise') ||
                               workflow.complexity?.toLowerCase() === complexityFilter.toLowerCase();
      
      // Credentials filter
      const matchesCredentials = credentialsFilter === 'all' || 
                                (credentialsFilter === 'yes' && workflow.has_credentials) ||
                                (credentialsFilter === 'no' && !workflow.has_credentials);
      
      // Node count filter
      const matchesNodeCount = nodeCountFilter === 'all' || 
                              (nodeCountFilter === '1-5' && workflow.node_count >= 1 && workflow.node_count <= 5) ||
                              (nodeCountFilter === '6-15' && workflow.node_count >= 6 && workflow.node_count <= 15) ||
                              (nodeCountFilter === '16+' && workflow.node_count >= 16);
      
      // File size filter (in KB)
      const fileSizeKB = (workflow.size_bytes || 0) / 1024;
      const matchesFileSize = fileSizeFilter === 'all' ||
                             (fileSizeFilter === 'tiny' && fileSizeKB < 10) ||
                             (fileSizeFilter === 'small' && fileSizeKB >= 10 && fileSizeKB < 50) ||
                             (fileSizeFilter === 'medium' && fileSizeKB >= 50 && fileSizeKB < 150) ||
                             (fileSizeFilter === 'large' && fileSizeKB >= 150);
      
      return matchesSearch && matchesCategory && matchesService && matchesTrigger && 
             matchesComplexity && matchesCredentials && matchesNodeCount && matchesFileSize;
    });
    
    // Sort by semantic similarity if active
    if (useSemanticSearch && semanticResults.length > 0) {
      const similarityMap = new Map(semanticResults.map(r => [r.workflow_id, r.similarity]));
      filtered.sort((a, b) => (similarityMap.get(b.id) || 0) - (similarityMap.get(a.id) || 0));
    }
    
    setFilteredWorkflows(filtered);
    setCurrentPage(1);
  }, [searchTerm, workflows, categoryFilter, serviceFilter, triggerTypeFilter, complexityFilter, credentialsFilter, nodeCountFilter, useSemanticSearch, semanticResults]);

  const fetchWorkflows = async () => {
    try {
      // First, get the total count to know how many batches we need
      const countResponse = await fetch(
        `https://ugjeubqwmgnqvohmrkyv.supabase.co/rest/v1/workflows?select=count`,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnamV1YnF3bWducXZvaG1ya3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0Nzc5NDEsImV4cCI6MjA3MjA1Mzk0MX0.esXYyxM-eQbKBXhG2NKrzLsdiveNo4lBsK_rlv_ebjo',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnamV1YnF3bWducXZvaG1ya3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0Nzc5NDEsImV4cCI6MjA3MjA1Mzk0MX0.esXYyxM-eQbKBXhG2NKrzLsdiveNo4lBsK_rlv_ebjo`,
            'Prefer': 'count=exact'
          },
        }
      );

      const countHeader = countResponse.headers.get('Content-Range');
      const totalCount = countHeader ? parseInt(countHeader.split('/')[1]) : 2046;
      console.log(`Total workflows in database: ${totalCount}`);

      // Fetch workflows in batches of 1000 to overcome Supabase limits
      const batchSize = 1000;
      const batches = Math.ceil(totalCount / batchSize);
      let allWorkflows: Workflow[] = [];

      for (let i = 0; i < batches; i++) {
        const start = i * batchSize;
        const end = start + batchSize - 1;
        
        console.log(`Fetching batch ${i + 1}/${batches} (records ${start}-${end})`);
        
        const response = await fetch(
          `https://ugjeubqwmgnqvohmrkyv.supabase.co/rest/v1/workflows?select=id,name,category,node_count,has_credentials,raw_url,complexity,size_bytes&order=name.asc`,
          {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnamV1YnF3bWducXZvaG1ya3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0Nzc5NDEsImV4cCI6MjA3MjA1Mzk0MX0.esXYyxM-eQbKBXhG2NKrzLsdiveNo4lBsK_rlv_ebjo',
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnamV1YnF3bWducXZvaG1ya3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0Nzc5NDEsImV4cCI6MjA3MjA1Mzk0MX0.esXYyxM-eQbKBXhG2NKrzLsdiveNo4lBsK_rlv_ebjo`,
              'Range': `${start}-${end}`
            },
          }
        );

        if (!response.ok) throw new Error(`Failed to fetch batch ${i + 1}`);
        
        const batchData = await response.json();
        allWorkflows = [...allWorkflows, ...batchData];
        
        console.log(`Batch ${i + 1} complete. Total loaded: ${allWorkflows.length}`);
      }

      console.log(`Successfully loaded all ${allWorkflows.length} workflows from Supabase`);
      setWorkflows(allWorkflows);
      setFilteredWorkflows(allWorkflows);
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

  // Service categories based on workflow names and content
  const getServiceCategory = (workflow: Workflow) => {
    const name = workflow.name.toLowerCase();
    const category = workflow.category.toLowerCase();
    
    // Messaging & Communication
    if (name.includes('telegram') || name.includes('discord') || name.includes('slack') || 
        name.includes('whatsapp') || name.includes('teams') || name.includes('sms')) {
      return 'messaging';
    }
    
    // AI & Machine Learning
    if (name.includes('openai') || name.includes('anthropic') || name.includes('hugging') || 
        name.includes('ai') || name.includes('gpt') || name.includes('claude')) {
      return 'ai_ml';
    }
    
    // Database & Storage
    if (name.includes('postgresql') || name.includes('mysql') || name.includes('mongodb') || 
        name.includes('redis') || name.includes('airtable') || name.includes('database') ||
        name.includes('sql') || name.includes('db')) {
      return 'database';
    }
    
    // Email Services
    if (name.includes('gmail') || name.includes('mailjet') || name.includes('outlook') || 
        name.includes('email') || name.includes('smtp') || name.includes('imap')) {
      return 'email';
    }
    
    // Cloud Storage
    if (name.includes('google drive') || name.includes('google docs') || name.includes('dropbox') || 
        name.includes('onedrive') || name.includes('sheets') || name.includes('docs')) {
      return 'cloud_storage';
    }
    
    // Project Management
    if (name.includes('jira') || name.includes('github') || name.includes('gitlab') || 
        name.includes('trello') || name.includes('asana') || name.includes('notion')) {
      return 'project_management';
    }
    
    // Social Media
    if (name.includes('linkedin') || name.includes('twitter') || name.includes('facebook') || 
        name.includes('instagram') || name.includes('social')) {
      return 'social_media';
    }
    
    // E-commerce
    if (name.includes('shopify') || name.includes('stripe') || name.includes('paypal') || 
        name.includes('woocommerce') || name.includes('payment')) {
      return 'ecommerce';
    }
    
    // Analytics
    if (name.includes('analytics') || name.includes('mixpanel') || name.includes('tracking')) {
      return 'analytics';
    }
    
    // Calendar & Tasks
    if (name.includes('calendar') || name.includes('cal.com') || name.includes('calendly') || 
        name.includes('schedule')) {
      return 'calendar_tasks';
    }
    
    // Forms
    if (name.includes('typeform') || name.includes('forms') || name.includes('form')) {
      return 'forms';
    }
    
    // Development & DevOps
    if (name.includes('webhook') || name.includes('http') || name.includes('api') || 
        name.includes('graphql') || name.includes('rest') || name.includes('development')) {
      return 'development';
    }
    
    return 'other';
  };

  // Detect trigger type based on workflow characteristics
  const getTriggerType = (workflow: Workflow) => {
    const name = workflow.name.toLowerCase();
    
    if (name.includes('webhook') || name.includes('api')) return 'webhook';
    if (name.includes('schedule') || name.includes('cron') || name.includes('daily') || 
        name.includes('hourly') || name.includes('weekly')) return 'scheduled';
    if (name.includes('manual') || name.includes('trigger')) return 'manual';
    if (workflow.node_count > 15) return 'complex';
    
    return 'simple';
  };

  // Enhanced complexity categorization with granular levels
  const getEnhancedComplexity = (nodeCount: number) => {
    if (nodeCount <= 5) return 'starter';
    if (nodeCount <= 15) return 'basic';
    if (nodeCount <= 30) return 'intermediate';
    if (nodeCount <= 50) return 'advanced';
    if (nodeCount <= 70) return 'expert';
    return 'enterprise';
  };
  
  const getGranularComplexityLabel = (nodeCount: number) => {
    const complexity = getEnhancedComplexity(nodeCount);
    const labels = {
      'starter': 'Starter',
      'basic': 'Basic',
      'intermediate': 'Intermediate',
      'advanced': 'Advanced',
      'expert': 'Expert',
      'enterprise': 'Enterprise'
    };
    return labels[complexity as keyof typeof labels] || complexity;
  };

  const getComplexityColor = (complexity: string, nodeCount?: number) => {
    // Use node count for more accurate granular coloring if available
    if (nodeCount) {
      const granular = getEnhancedComplexity(nodeCount);
      switch (granular) {
        case 'starter':
          return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
        case 'basic':
          return 'bg-green-500/20 text-green-300 border-green-400/30';
        case 'intermediate':
          return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
        case 'advanced':
          return 'bg-orange-500/20 text-orange-300 border-orange-400/30';
        case 'expert':
          return 'bg-red-500/20 text-red-300 border-red-400/30';
        case 'enterprise':
          return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      }
    }
    
    // Fallback to original complexity string
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
  
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const kb = bytes / 1024;
    if (kb < 1) return `${bytes}B`;
    if (kb < 1024) return `${kb.toFixed(1)}KB`;
    return `${(kb / 1024).toFixed(1)}MB`;
  };

  const paginatedWorkflows = filteredWorkflows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredWorkflows.length / itemsPerPage);
  
  // Get unique categories for filter dropdown
  const uniqueCategories = [...new Set(workflows.map(w => w.category))].sort();
  
  const clearAllFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setServiceFilter('all');
    setTriggerTypeFilter('all');
    setComplexityFilter('all');
    setCredentialsFilter('all');
    setNodeCountFilter('all');
    setFileSizeFilter('all');
  };
  
  const hasActiveFilters = searchTerm || categoryFilter !== 'all' || serviceFilter !== 'all' || 
                          triggerTypeFilter !== 'all' || complexityFilter !== 'all' || 
                          credentialsFilter !== 'all' || nodeCountFilter !== 'all' || 
                          fileSizeFilter !== 'all';

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
            Browse and download automation workflows. 
            Each workflow is production-ready and includes detailed integration information.
          </p>
          
          <div className="space-y-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-xl">
                {useSemanticSearch ? (
                  <Sparkles className="absolute left-4 top-1/2 transform -translate-y-1/2 text-brand-primary w-4 h-4" />
                ) : (
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                )}
                <Input
                  type="text"
                  placeholder={useSemanticSearch ? "Describe what you're looking for..." : "Search workflows by name or category..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 glass border-neon-primary/20 focus:border-neon-primary/50 bg-surface-card/50"
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 glass px-4 py-2 rounded-lg">
                <Switch
                  id="semantic-search"
                  checked={useSemanticSearch}
                  onCheckedChange={setUseSemanticSearch}
                />
                <Label htmlFor="semantic-search" className="cursor-pointer flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-primary" />
                  <span className="text-sm">Smart Search</span>
                </Label>
              </div>
            </div>
            {useSemanticSearch && semanticResults.length > 0 && searchTerm && (
              <div className="text-sm text-text-mid">
                ✨ Found {semanticResults.length} semantically similar workflows
              </div>
            )}
            
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-text-secondary" />
                <span className="text-text-secondary text-sm">Filters:</span>
              </div>
              
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-36 glass border-neon-primary/20">
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="messaging">💬 Messaging</SelectItem>
                  <SelectItem value="ai_ml">🤖 AI & ML</SelectItem>
                  <SelectItem value="database">🗄️ Database</SelectItem>
                  <SelectItem value="email">📧 Email</SelectItem>
                  <SelectItem value="cloud_storage">☁️ Cloud Storage</SelectItem>
                  <SelectItem value="project_management">📋 Project Mgmt</SelectItem>
                  <SelectItem value="social_media">📱 Social Media</SelectItem>
                  <SelectItem value="ecommerce">🛒 E-commerce</SelectItem>
                  <SelectItem value="analytics">📊 Analytics</SelectItem>
                  <SelectItem value="calendar_tasks">📅 Calendar</SelectItem>
                  <SelectItem value="forms">📝 Forms</SelectItem>
                  <SelectItem value="development">⚙️ Development</SelectItem>
                  <SelectItem value="other">📦 Other</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={triggerTypeFilter} onValueChange={setTriggerTypeFilter}>
                <SelectTrigger className="w-32 glass border-neon-primary/20">
                  <SelectValue placeholder="Trigger" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Triggers</SelectItem>
                  <SelectItem value="webhook">🔗 Webhook</SelectItem>
                  <SelectItem value="scheduled">⏰ Scheduled</SelectItem>
                  <SelectItem value="manual">👆 Manual</SelectItem>
                  <SelectItem value="complex">🔄 Complex</SelectItem>
                  <SelectItem value="simple">⚡ Simple</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={complexityFilter} onValueChange={setComplexityFilter}>
                <SelectTrigger className="w-44 glass border-neon-primary/20">
                  <SelectValue placeholder="Complexity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="starter">🌱 Starter (1-5)</SelectItem>
                  <SelectItem value="basic">🟢 Basic (6-15)</SelectItem>
                  <SelectItem value="intermediate">🟡 Intermediate (16-30)</SelectItem>
                  <SelectItem value="advanced">🟠 Advanced (31-50)</SelectItem>
                  <SelectItem value="expert">🔴 Expert (51-70)</SelectItem>
                  <SelectItem value="enterprise">🟣 Enterprise (71+)</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={credentialsFilter} onValueChange={setCredentialsFilter}>
                <SelectTrigger className="w-32 glass border-neon-primary/20">
                  <SelectValue placeholder="Auth" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Auth</SelectItem>
                  <SelectItem value="no">🔓 No Auth</SelectItem>
                  <SelectItem value="yes">🔐 Auth Required</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={nodeCountFilter} onValueChange={setNodeCountFilter}>
                <SelectTrigger className="w-36 glass border-neon-primary/20">
                  <SelectValue placeholder="Node Count" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Node Count</SelectItem>
                  <SelectItem value="1-5">📱 Tiny (1-5)</SelectItem>
                  <SelectItem value="6-15">💻 Medium (6-15)</SelectItem>
                  <SelectItem value="16+">🖥️ Large (16+)</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={fileSizeFilter} onValueChange={setFileSizeFilter}>
                <SelectTrigger className="w-36 glass border-neon-primary/20">
                  <SelectValue placeholder="File Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any File Size</SelectItem>
                  <SelectItem value="tiny">🪶 Tiny (&lt;10KB)</SelectItem>
                  <SelectItem value="small">📄 Small (10-50KB)</SelectItem>
                  <SelectItem value="medium">📋 Medium (50-150KB)</SelectItem>
                  <SelectItem value="large">📦 Large (150KB+)</SelectItem>
                </SelectContent>
              </Select>
              
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearAllFilters}
                  className="border-neon-primary/30 text-neon-primary hover:bg-neon-primary/10"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-6 mb-8 text-sm">
            <div className="glass px-4 py-2 rounded-lg">
              <span className="text-text-secondary">Total workflows:</span>
              <span className="ml-2 text-neon-primary font-semibold">{workflows.length}</span>
            </div>
            <div className="glass px-4 py-2 rounded-lg">
              <span className="text-text-secondary">Showing:</span>
              <span className="ml-2 text-neon-primary font-semibold">{paginatedWorkflows.length}</span>
              <span className="text-text-secondary"> of {filteredWorkflows.length}</span>
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
            <div key={workflow.id} className="project-card hover-lift hover-glow group cursor-pointer">
              <Link to={`/workflows/${workflow.id}`} className="block">
                <div className="flex justify-between items-start gap-3 mb-3">
                  <h3 className="text-text-primary text-lg font-semibold font-sora line-clamp-2 flex-1 group-hover:text-brand-accent transition-colors">
                    {workflow.name}
                  </h3>
                  <Badge className={getComplexityColor(workflow.complexity, workflow.node_count)}>
                    {getGranularComplexityLabel(workflow.node_count)}
                  </Badge>
                </div>
                
                <p className="text-text-secondary text-sm mb-3 capitalize">
                  {workflow.category}
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-neon-primary rounded-full"></span>
                      {workflow.node_count} nodes
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-brand-accent rounded-full"></span>
                      {formatFileSize(workflow.size_bytes)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {workflow.has_credentials ? (
                      <>
                        <Shield className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400">Auth Required</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-green-400" />
                        <span className="text-green-400">No Auth</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
              
              <div className="flex gap-2">
                <Link
                  to={`/workflows/${workflow.id}`}
                  className="flex-1"
                >
                  <Button
                    className="w-full bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-accent border border-brand-primary/30 hover:border-brand-primary/50 transition-all duration-300"
                    size="sm"
                    variant="outline"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Preview
                  </Button>
                </Link>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    downloadWorkflow(workflow);
                  }}
                  className="gradient-primary hover:shadow-lg transition-all duration-300"
                  size="sm"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
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