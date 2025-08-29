import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Download, ExternalLink, Clock, Settings, Tags, ArrowLeft } from 'lucide-react';
import { getRealWorkflowsByCategory, getAllRealCategories, searchRealWorkflows, type RealWorkflow } from '@/data/realWorkflows';
import { WorkflowDownloadButton } from '@/components/WorkflowDownloadButton';

const WorkflowCategory: React.FC = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [complexityFilter, setComplexityFilter] = useState<string>('all');

  // Map URL params to category names
  const categoryMapping: { [key: string]: string } = {
    'crm-sales': 'CRM & Sales',
    'ai-powered': 'AI-Powered', 
    'social-media': 'Social Media',
    'marketing': 'Marketing',
    'business-operations': 'Business Operations',
  };

  const actualCategory = categoryName ? categoryMapping[categoryName] || categoryName : '';
  
  const workflows = getRealWorkflowsByCategory(actualCategory);
  const allCategories = getAllRealCategories();

  const filteredWorkflows = useMemo(() => {
    if (!workflows.length) return [];
    
    return workflows.filter(workflow => {
      const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workflow.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workflow.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        workflow.integrations.some(integration => integration.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesComplexity = complexityFilter === 'all' || workflow.complexity === complexityFilter;
      
      return matchesSearch && matchesComplexity;
    });
  }, [workflows, searchTerm, complexityFilter]);

  if (!actualCategory || !workflows.length) {
    return (
      <div className="min-h-screen bg-hero-bg py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-text-high mb-4">Category Not Found</h1>
          <p className="text-text-mid mb-8">The requested workflow category could not be found or has no workflows.</p>
          <Link to="/projects">
            <Button className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero-bg py-20">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/projects">
            <Button variant="ghost" className="flex items-center gap-2 text-text-mid hover:text-text-high">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-high mb-4">
            {actualCategory} Workflows
          </h1>
          <p className="text-text-mid text-lg mb-6">
            Professional n8n automation workflows from the Zie619/n8n-workflows repository
          </p>
          <div className="flex justify-center items-center gap-6 text-sm text-text-mid">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>{workflows.length} workflows</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>Ready to import</span>
            </div>
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              <span>GitHub source</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-mid h-4 w-4" />
            <Input
              placeholder="Search workflows, integrations, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={complexityFilter} onValueChange={setComplexityFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Complexity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-text-mid">
            Showing {filteredWorkflows.length} of {workflows.length} workflows
          </p>
        </div>

        {/* Workflows Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((workflow) => (
            <RealWorkflowCard key={workflow.id} workflow={workflow} />
          ))}
        </div>

        {filteredWorkflows.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-mid text-lg mb-4">No workflows found matching your criteria.</p>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setComplexityFilter('all');
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

interface RealWorkflowCardProps {
  workflow: RealWorkflow;
}

const RealWorkflowCard: React.FC<RealWorkflowCardProps> = ({ workflow }) => {
  const complexityColors = {
    Beginner: 'bg-green-500/20 text-green-300 border-green-500/30',
    Intermediate: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    Advanced: 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  return (
    <Card className="bg-card-bg border-card-border hover:border-brand-primary/50 transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <Badge className={`text-xs ${complexityColors[workflow.complexity]} border`}>
            {workflow.complexity}
          </Badge>
          <div className="flex items-center text-text-mid text-sm">
            <Clock className="w-3 h-3 mr-1" />
            {workflow.setupTime}
          </div>
        </div>
        <CardTitle className="text-text-high text-lg group-hover:text-brand-primary transition-colors">
          {workflow.name}
        </CardTitle>
        <CardDescription className="text-text-mid text-sm">
          {workflow.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-mid">Use Case:</span>
            <span className="text-text-high">{workflow.useCase}</span>
          </div>
          
          {workflow.nodeCount && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-mid">Nodes:</span>
              <span className="text-text-high">{workflow.nodeCount}</span>
            </div>
          )}
          
          {workflow.triggerType && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-mid">Trigger:</span>
              <span className="text-text-high">{workflow.triggerType}</span>
            </div>
          )}
          
          <div>
            <p className="text-text-mid text-sm mb-2">Integrations:</p>
            <div className="flex flex-wrap gap-1">
              {workflow.integrations.slice(0, 3).map((integration) => (
                <Badge key={integration} variant="secondary" className="text-xs">
                  {integration}
                </Badge>
              ))}
              {workflow.integrations.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{workflow.integrations.length - 3} more
                </Badge>
              )}
            </div>
          </div>
          
          <div>
            <div className="flex flex-wrap gap-1 mb-3">
              <Tags className="w-3 h-3 text-text-mid mt-0.5 mr-1" />
              {workflow.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {workflow.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{workflow.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="pt-2">
          <WorkflowDownloadButton
            workflowId={workflow.id}
            workflowName={workflow.name}
            rawUrl={workflow.downloadUrl}
            showPreview={true}
            size="sm"
          />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowCategory;