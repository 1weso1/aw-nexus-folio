import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WorkflowDownloadButton } from './WorkflowDownloadButton';
import { Eye, Calendar, Layers, Shield, ShieldCheck } from 'lucide-react';
import { WorkflowItem } from '@/types/workflow';
import { formatDistanceToNow } from 'date-fns';

interface WorkflowCardProps {
  workflow: WorkflowItem;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  showSelect?: boolean;
  onPreview?: (slug: string) => void;
}

const complexityColors = {
  'Easy': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  'Medium': 'bg-amber-500/10 text-amber-700 dark:text-amber-400', 
  'Advanced': 'bg-red-500/10 text-red-700 dark:text-red-400'
};

export const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
  isSelected = false,
  onSelect,
  showSelect = false,
  onPreview
}) => {
  const handlePreview = () => {
    if (onPreview) {
      onPreview(workflow.id);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelect) {
      onSelect(workflow.id, e.target.checked);
    }
  };

  return (
    <Card className={`group hover:shadow-lg transition-all duration-200 ${isSelected ? 'ring-2 ring-brand-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-text-high group-hover:text-brand-primary transition-colors line-clamp-2">
              {workflow.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {workflow.category}
              </Badge>
              <Badge 
                variant="outline" 
                className={`text-xs ${complexityColors[workflow.complexity]}`}
              >
                {workflow.complexity}
              </Badge>
            </div>
          </div>
          {showSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleSelectChange}
              className="ml-3 mt-1 h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
            />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Workflow Stats */}
        <div className="flex items-center gap-4 text-sm text-text-mid">
          <div className="flex items-center gap-1">
            <Layers className="h-4 w-4" />
            <span>{workflow.nodeCount} nodes</span>
          </div>
          <div className="flex items-center gap-1">
            {workflow.hasCredentials ? (
              <Shield className="h-4 w-4 text-amber-500" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
            )}
            <span className="text-xs">
              {workflow.hasCredentials ? 'Needs auth' : 'No auth'}
            </span>
          </div>
          {workflow.updatedAt && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">
                {formatDistanceToNow(new Date(workflow.updatedAt), { addSuffix: true })}
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {workflow.tags && workflow.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {workflow.tags.slice(0, 4).map((tag) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="text-xs px-2 py-0.5 bg-bg-card text-text-mid border-border-subtle"
              >
                {tag}
              </Badge>
            ))}
            {workflow.tags.length > 4 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                +{workflow.tags.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePreview}
            className="flex-1 text-xs"
          >
            <Eye className="h-3 w-3 mr-1" />
            Preview
          </Button>
          <WorkflowDownloadButton
            workflowId={workflow.id}
            workflowName={workflow.name}
            rawUrl={workflow.rawUrl}
            variant="default"
            size="sm"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowCard;