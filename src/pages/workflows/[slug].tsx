import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, Copy, ExternalLink, Eye, AlertCircle, Loader2, Calendar, Tag, Settings, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { getWorkflowBySlug, fetchWorkflowRaw, getRelatedWorkflows } from "@/lib/workflows";
import type { WorkflowItem, N8nWorkflow } from "@/types/workflow";
import { WorkflowVisualization } from "@/components/WorkflowVisualization";

export default function WorkflowDetail() {
  const { slug } = useParams<{ slug: string }>();
  
  const [workflow, setWorkflow] = useState<WorkflowItem | null>(null);
  const [workflowData, setWorkflowData] = useState<N8nWorkflow | null>(null);
  const [relatedWorkflows, setRelatedWorkflows] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWorkflow() {
      if (!slug) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Load workflow by slug
        const foundWorkflow = await getWorkflowBySlug(slug);
        
        if (!foundWorkflow) {
          setError('Workflow not found');
          return;
        }
        
        setWorkflow(foundWorkflow);
        
        // Load workflow JSON
        try {
          const workflowJson = await fetchWorkflowRaw(foundWorkflow.rawUrl);
          setWorkflowData(workflowJson);
        } catch (err) {
          console.error('Failed to load workflow JSON:', err);
          // Continue without workflow data - we can still show metadata
        }
        
        // Load related workflows
        const related = await getRelatedWorkflows(slug, 6);
        setRelatedWorkflows(related);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load workflow');
      } finally {
        setLoading(false);
      }
    }
    
    loadWorkflow();
  }, [slug]);

  const handleDownload = async () => {
    if (!workflow) return;
    
    try {
      const response = await fetch(workflow.rawUrl);
      if (!response.ok) throw new Error('Failed to fetch workflow');
      
      const content = await response.text();
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const element = document.createElement('a');
      element.href = url;
      element.download = `${workflow.id}.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${workflow.name}`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download workflow');
    }
  };

  const handleCopyJson = async () => {
    if (!workflowData) return;
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(workflowData, null, 2));
      toast.success('Workflow JSON copied to clipboard');
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-4">Workflow Not Found</h1>
          <p className="text-text-secondary mb-6">{error}</p>
          <Button asChild variant="neon">
            <Link to="/workflows">
              <ArrowLeft className="h-4 w-4" />
              Back to Workflows
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loading || !workflow) {
    return (
      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-10 w-32 mb-4" />
            <Skeleton className="h-12 w-96 mb-2" />
            <Skeleton className="h-6 w-64" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <Skeleton className="h-96 w-full mb-8" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const complexityColors = {
    'Easy': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Advanced': 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Button asChild variant="ghost">
            <Link to="/workflows">
              <ArrowLeft className="h-4 w-4" />
              Back to Workflows
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge className={`${complexityColors[workflow.complexity]} border`}>
              {workflow.complexity}
            </Badge>
            <Badge variant="outline" className="border-neon-primary/20 text-neon-primary">
              {workflow.category}
            </Badge>
            <Badge variant="outline" className={workflow.hasCredentials ? "border-yellow-500/30 text-yellow-400" : "border-green-500/30 text-green-400"}>
              {workflow.hasCredentials ? "Credentials Required" : "No Credentials"}
            </Badge>
          </div>

          <h1 className="hero-text text-4xl md:text-5xl mb-4">{workflow.name}</h1>
          
          <div className="flex items-center text-text-secondary mb-6 gap-4">
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              <span>{workflow.nodeCount} nodes</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Updated {new Date(workflow.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {workflow.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {workflow.tags.map(tag => (
                <Badge key={tag} variant="outline" className="border-neon-primary/20 text-neon-primary">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Workflow Visualization */}
            <div className="glass rounded-xl p-6 mb-8">
              <h2 className="section-heading">Workflow Preview</h2>
              {workflowData ? (
                <WorkflowVisualization workflow={workflowData} />
              ) : (
                <div className="h-96 bg-surface-card/50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-neon-primary mx-auto mb-2" />
                    <p className="text-text-secondary">Loading workflow visualization...</p>
                  </div>
                </div>
              )}
            </div>

            {/* How to Import */}
            <div className="glass rounded-xl p-6 mb-8">
              <h2 className="section-heading">How to Import into n8n</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-neon-primary rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-text-primary">Step 1: Download the workflow</p>
                    <p className="text-text-secondary text-sm">Click the "Download JSON" button to save the workflow file to your computer.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-neon-primary rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-text-primary">Step 2: Open n8n</p>
                    <p className="text-text-secondary text-sm">Navigate to your n8n instance and go to the workflows section.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-neon-primary rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-text-primary">Step 3: Import workflow</p>
                    <p className="text-text-secondary text-sm">Click "Import from file" and select the downloaded JSON file.</p>
                  </div>
                </div>
                {workflow.hasCredentials && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-yellow-400">Step 4: Configure credentials</p>
                      <p className="text-text-secondary text-sm">This workflow requires credentials. Set up the necessary API keys and authentication in n8n.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Quick Actions */}
              <div className="glass rounded-xl p-6">
                <h3 className="font-sora font-semibold text-text-primary mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button onClick={handleDownload} variant="neon" className="w-full">
                    <Download className="h-4 w-4" />
                    Download JSON
                  </Button>
                  {workflowData && (
                    <Button onClick={handleCopyJson} variant="outline" className="w-full">
                      <Copy className="h-4 w-4" />
                      Copy JSON
                    </Button>
                  )}
                  <Button asChild variant="ghost" className="w-full">
                    <a href={workflow.rawUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      Open Raw File
                    </a>
                  </Button>
                </div>
              </div>

              {/* Workflow Details */}
              <div className="glass rounded-xl p-6">
                <h3 className="font-sora font-semibold text-text-primary mb-4">Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-text-secondary">Category:</span>
                    <span className="ml-2 text-text-primary font-medium">{workflow.category}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Complexity:</span>
                    <span className="ml-2 text-text-primary font-medium">{workflow.complexity}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Node Count:</span>
                    <span className="ml-2 text-text-primary font-medium">{workflow.nodeCount}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">File Size:</span>
                    <span className="ml-2 text-text-primary font-medium">{Math.round(workflow.size / 1024)} KB</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Last Updated:</span>
                    <span className="ml-2 text-text-primary font-medium">
                      {new Date(workflow.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="glass rounded-xl p-6">
                <h3 className="font-sora font-semibold text-text-primary mb-4">Need Help?</h3>
                <p className="text-text-secondary text-sm mb-4">
                  Have questions about this workflow or need customization?
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/contact">
                    <Settings className="h-4 w-4" />
                    Contact Me
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Workflows */}
        {relatedWorkflows.length > 0 && (
          <div className="mt-12">
            <h2 className="section-heading">Related Workflows</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedWorkflows.map(related => (
                <Link key={related.id} to={`/workflows/${related.id}`} className="glass rounded-xl p-6 hover-lift hover-glow block border border-neon-primary/10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-text-primary">{related.name}</h3>
                    <Badge className={`${complexityColors[related.complexity]} border text-xs`}>
                      {related.complexity}
                    </Badge>
                  </div>
                  <p className="text-text-secondary text-sm mb-3">{related.category}</p>
                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <span>{related.nodeCount} nodes</span>
                    <span>{related.hasCredentials ? "Credentials" : "No creds"}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}