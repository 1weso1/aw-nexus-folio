import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, Download, ExternalLink, Clock, Settings, Tags, Users, Star } from 'lucide-react';
import { realWorkflowData, getAllRealCategories, searchRealWorkflows, realWorkflowStats, type RealWorkflow } from '@/data/realWorkflows';
import { WorkflowDownloadButton } from '@/components/WorkflowDownloadButton';

const WorkflowBrowser: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [complexityFilter, setComplexityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'complexity' | 'setupTime'>('name');

  const allCategories = getAllRealCategories();

  const filteredAndSortedWorkflows = useMemo(() => {
    let workflows = realWorkflowData;

    // Apply filters
    if (searchTerm) {
      workflows = searchRealWorkflows(searchTerm);
    }

    if (categoryFilter !== 'all') {
      workflows = workflows.filter(workflow => workflow.category === categoryFilter);
    }

    if (complexityFilter !== 'all') {
      workflows = workflows.filter(workflow => workflow.complexity === complexityFilter);
    }

    // Apply sorting
    workflows = [...workflows].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'complexity':
          const complexityOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
          return complexityOrder[a.complexity] - complexityOrder[b.complexity];
        case 'setupTime':
          return parseInt(a.setupTime) - parseInt(b.setupTime);
        default:
          return 0;
      }
    });

    return workflows;
  }, [searchTerm, categoryFilter, complexityFilter, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setComplexityFilter('all');
    setSortBy('name');
  };

  return (
    <div className="min-h-screen bg-hero-bg py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-high mb-4">
            n8n Workflow Library
          </h1>
          <p className="text-text-mid text-lg mb-6">
            Browse {realWorkflowStats.totalWorkflows} professional automation workflows from the Zie619/n8n-workflows repository
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
            <div className="bg-card-bg border border-card-border rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 text-brand-primary mb-1">
                <Settings className="h-4 w-4" />
                <span className="text-2xl font-bold">{realWorkflowStats.totalWorkflows}</span>
              </div>
              <p className="text-sm text-text-mid">Workflows</p>
            </div>
            <div className="bg-card-bg border border-card-border rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 text-brand-accent mb-1">
                <Users className="h-4 w-4" />
                <span className="text-2xl font-bold">{realWorkflowStats.totalIntegrations}</span>
              </div>
              <p className="text-sm text-text-mid">Integrations</p>
            </div>
            <div className="bg-card-bg border border-card-border rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 text-brand-primary mb-1">
                <Filter className="h-4 w-4" />
                <span className="text-2xl font-bold">{realWorkflowStats.categories}</span>
              </div>
              <p className="text-sm text-text-mid">Categories</p>
            </div>
            <div className="bg-card-bg border border-card-border rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 text-brand-accent mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-2xl font-bold">{realWorkflowStats.averageSetupTime}m</span>
              </div>
              <p className="text-sm text-text-mid">Avg Setup</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-card-bg border border-card-border rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-mid h-4 w-4" />
              <Input
                placeholder="Search workflows, integrations, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {allCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={complexityFilter} onValueChange={setComplexityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: 'name' | 'complexity' | 'setupTime') => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="complexity">Complexity</SelectItem>
                <SelectItem value="setupTime">Setup Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-text-mid text-sm">
              Showing {filteredAndSortedWorkflows.length} of {realWorkflowStats.totalWorkflows} workflows
            </p>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Workflows Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedWorkflows.map((workflow) => (
            <BrowserWorkflowCard key={workflow.id} workflow={workflow} />
          ))}
        </div>

        {filteredAndSortedWorkflows.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Search className="h-12 w-12 text-text-mid mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-high mb-2">No workflows found</h3>
              <p className="text-text-mid mb-6">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <Button onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          </div>
        )}

        {/* Repository Link */}
        <div className="mt-12 text-center">
          <div className="bg-card-bg border border-card-border rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-text-high mb-2">Source Repository</h3>
            <p className="text-text-mid mb-4">
              All workflows are sourced from the popular Zie619/n8n-workflows GitHub repository with 25.4k+ stars.
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.open('https://github.com/Zie619/n8n-workflows', '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View on GitHub
              <Badge variant="secondary" className="ml-2">
                <Star className="h-3 w-3 mr-1" />
                25.4k
              </Badge>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface BrowserWorkflowCardProps {
  workflow: RealWorkflow;
}

const BrowserWorkflowCard: React.FC<BrowserWorkflowCardProps> = ({ workflow }) => {
  const complexityColors = {
    Beginner: 'bg-green-500/20 text-green-300 border-green-500/30',
    Intermediate: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    Advanced: 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  return (
    <Card className="bg-card-bg border-card-border hover:border-brand-primary/50 transition-all duration-300 group h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <Badge className={`text-xs ${complexityColors[workflow.complexity]} border`}>
            {workflow.complexity}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {workflow.category}
          </Badge>
        </div>
        <CardTitle className="text-text-high text-lg group-hover:text-brand-primary transition-colors line-clamp-2">
          {workflow.name}
        </CardTitle>
        <CardDescription className="text-text-mid text-sm line-clamp-3">
          {workflow.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0 flex flex-col justify-between flex-1">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-mid">Use Case:</span>
              <span className="text-text-high text-xs">{workflow.useCase}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-mid">Setup:</span>
              <div className="flex items-center gap-1 text-text-high text-xs">
                <Clock className="w-3 h-3" />
                {workflow.setupTime}
              </div>
            </div>
            {workflow.nodeCount && (
              <div className="flex items-center justify-between">
                <span className="text-text-mid">Nodes:</span>
                <span className="text-text-high text-xs">{workflow.nodeCount}</span>
              </div>
            )}
            {workflow.triggerType && (
              <div className="flex items-center justify-between">
                <span className="text-text-mid">Trigger:</span>
                <span className="text-text-high text-xs">{workflow.triggerType}</span>
              </div>
            )}
          </div>
          
          <div>
            <p className="text-text-mid text-xs mb-2">Top Integrations:</p>
            <div className="flex flex-wrap gap-1">
              {workflow.integrations.slice(0, 3).map((integration) => (
                <Badge key={integration} variant="secondary" className="text-xs">
                  {integration}
                </Badge>
              ))}
              {workflow.integrations.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{workflow.integrations.length - 3}
                </Badge>
              )}
            </div>
          </div>
          
          <div>
            <div className="flex flex-wrap gap-1">
              <Tags className="w-3 h-3 text-text-mid mt-0.5 mr-1" />
              {workflow.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {workflow.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{workflow.tags.length - 2}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="pt-4 mt-auto">
            <WorkflowDownloadButton
              workflowId={workflow.id}
              workflowName={workflow.name}
              rawUrl={workflow.downloadUrl}
              showPreview={true}
              size="sm"
            />
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowBrowser;