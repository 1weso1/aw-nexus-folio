import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Clock, Users, Download, ExternalLink } from 'lucide-react';
import { useState, useMemo } from 'react';
import { getWorkflowsByCategory, categoryStats, type Workflow } from '@/data/workflows';

const complexityColors = {
  'Beginner': 'bg-accent/20 text-accent-foreground border-accent/30',
  'Intermediate': 'bg-secondary/20 text-secondary-foreground border-secondary/30',
  'Advanced': 'bg-destructive/20 text-destructive-foreground border-destructive/30',
};

export default function WorkflowCategory() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [complexityFilter, setComplexityFilter] = useState<string>('all');

  const categoryDisplayName = categoryName?.replace('-', ' & ') || '';
  const workflows = getWorkflowsByCategory(categoryDisplayName);
  const categoryInfo = categoryStats[categoryDisplayName as keyof typeof categoryStats];

  const filteredWorkflows = useMemo(() => {
    return workflows.filter(workflow => {
      const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          workflow.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          workflow.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesComplexity = complexityFilter === 'all' || workflow.complexity === complexityFilter;
      
      return matchesSearch && matchesComplexity;
    });
  }, [workflows, searchTerm, complexityFilter]);

  if (!categoryInfo) {
    return (
      <div className="min-h-screen bg-hero-bg px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-text-high mb-4">Category Not Found</h1>
          <Button onClick={() => navigate('/projects/crm-automation')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to CRM Automation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero-bg px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            onClick={() => navigate('/projects/crm-automation')} 
            variant="ghost" 
            className="mb-4 text-text-mid hover:text-text-high"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to CRM Automation
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-text-high mb-4">
              {categoryDisplayName} Workflows
            </h1>
            <p className="text-text-mid text-lg mb-2">{categoryInfo.description}</p>
            <div className="flex items-center justify-center gap-4 text-sm text-text-mid">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {categoryInfo.count} workflows
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-card-bg border-border"
            />
          </div>
          <Select value={complexityFilter} onValueChange={setComplexityFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-card-bg border-border">
              <SelectValue placeholder="Filter by complexity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Workflows Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredWorkflows.map((workflow) => (
            <WorkflowCard key={workflow.id} workflow={workflow} />
          ))}
        </div>

        {filteredWorkflows.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-mid text-lg">No workflows found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function WorkflowCard({ workflow }: { workflow: Workflow }) {
  return (
    <Card className="bg-card-bg border-border hover:border-brand-primary/30 transition-all duration-300 group">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-text-high group-hover:text-brand-primary transition-colors">
            {workflow.name}
          </CardTitle>
          <Badge className={complexityColors[workflow.complexity]}>
            {workflow.complexity}
          </Badge>
        </div>
        <p className="text-text-mid text-sm">{workflow.description}</p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Use Case & Setup Time */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-mid">Use Case: <span className="text-text-high">{workflow.useCase}</span></span>
            <div className="flex items-center gap-1 text-text-mid">
              <Clock className="w-3 h-3" />
              {workflow.setupTime}
            </div>
          </div>

          {/* Integrations */}
          <div>
            <p className="text-xs text-text-mid mb-2">Integrations:</p>
            <div className="flex flex-wrap gap-1">
              {workflow.integrations.slice(0, 4).map((integration, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {integration}
                </Badge>
              ))}
              {workflow.integrations.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{workflow.integrations.length - 4} more
                </Badge>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="flex flex-wrap gap-1">
              {workflow.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" className="flex-1">
              <Download className="w-3 h-3 mr-1" />
              Download JSON
            </Button>
            <Button size="sm" variant="ghost">
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}