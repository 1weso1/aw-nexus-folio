import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, ExternalLink, Heart, Share } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import N8nPreview from "@/components/N8nPreview";

interface Workflow {
  id: string;
  name: string;
  category: string;
  node_count: number;
  has_credentials: boolean;
  raw_url: string;
  complexity: string;
  created_at: string;
  size_bytes: number;
}

interface WorkflowData {
  name: string;
  nodes: any[];
  connections: any;
  active?: boolean;
  settings?: any;
  staticData?: any;
  pinData?: any;
  versionId?: string;
  meta?: any;
  tags?: any[];
}

const WorkflowDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [workflowData, setWorkflowData] = useState<WorkflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchWorkflow = async () => {
      try {
        console.log('Fetching workflow with ID:', id);
        
        const { data, error } = await supabase
          .from('workflows')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching workflow:', error);
          toast.error("Workflow not found");
          return;
        }

        console.log('Workflow data:', data);
        setWorkflow(data);
        
        // Check if favorited (if user is logged in)
        if (user) {
          const { data: favoriteData } = await supabase
            .from('workflow_favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('workflow_id', id)
            .single();
          
          setIsFavorited(!!favoriteData);
        }
        
        // Fetch the actual workflow JSON data
        if (data.raw_url) {
          console.log('Fetching workflow JSON from:', data.raw_url);
          setDataLoading(true);
          setPreviewError(null);
          
          try {
            const workflowResponse = await fetch(data.raw_url);
            console.log('Workflow JSON response status:', workflowResponse.status);
            
            if (workflowResponse.ok) {
              const workflowJson = await workflowResponse.json();
              console.log('Workflow JSON data:', workflowJson);
              
              // Validate workflow structure
              if (!workflowJson || !workflowJson.nodes || !Array.isArray(workflowJson.nodes)) {
                throw new Error('Invalid workflow structure: missing or invalid nodes array');
              }
              
              setWorkflowData(workflowJson);
            } else {
              throw new Error(`Failed to fetch workflow JSON: ${workflowResponse.status} ${workflowResponse.statusText}`);
            }
          } catch (error) {
            console.error('Error fetching workflow data:', error);
            setPreviewError(error instanceof Error ? error.message : 'Unknown error occurred');
          } finally {
            setDataLoading(false);
          }
        } else {
          console.warn('No raw_url provided for workflow');
          setPreviewError('No workflow data URL available');
        }
      } catch (error) {
        console.error('Error:', error);
        setPreviewError(error instanceof Error ? error.message : 'Failed to load workflow');
        toast.error("Failed to load workflow");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflow();
  }, [id, user]);

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

  const downloadWorkflow = async () => {
    if (!workflowData || !workflow || !user) {
      toast.error('Please sign in to download workflows');
      navigate('/auth');
      return;
    }
    
    setDownloading(true);
    
    try {
      // Record the download
      const { error: downloadError } = await supabase
        .from('workflow_downloads')
        .insert({
          user_id: user.id,
          workflow_id: workflow.id,
          ip_address: null, // Could be populated by edge function
          user_agent: navigator.userAgent
        });

      if (downloadError) {
        console.error('Error recording download:', downloadError);
      }

      // Download the file
      const dataStr = JSON.stringify(workflowData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `${workflow.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success("Workflow downloaded successfully");
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Failed to download workflow");
    } finally {
      setDownloading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Please sign in to favorite workflows');
      navigate('/auth');
      return;
    }

    if (!workflow) return;

    try {
      if (isFavorited) {
        const { error } = await supabase
          .from('workflow_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('workflow_id', workflow.id);

        if (error) throw error;
        setIsFavorited(false);
        toast.success('Removed from favorites');
      } else {
        const { error } = await supabase
          .from('workflow_favorites')
          .insert({
            user_id: user.id,
            workflow_id: workflow.id
          });

        if (error) throw error;
        setIsFavorited(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
            <div className="h-64 bg-muted rounded mb-8"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="min-h-screen pt-20 pb-16">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost" 
            onClick={() => navigate('/workflows')}
            className="mb-8 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Workflows
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Workflow Not Found</h1>
            <p className="text-muted-foreground">The workflow you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost" 
            onClick={() => navigate('/workflows')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Workflows
          </Button>
          
          <div className="flex gap-2">
            {user && (
              <Button
                variant="outline"
                onClick={toggleFavorite}
                className={`glass border-primary/20 ${isFavorited ? 'text-red-400 border-red-400/30' : ''}`}
              >
                <Heart className={`mr-2 h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                {isFavorited ? 'Favorited' : 'Favorite'}
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={downloadWorkflow}
              disabled={downloading || !user}
              className="glass border-primary/20 hover:border-primary/40"
            >
              <Download className="mr-2 h-4 w-4" />
              {downloading ? 'Downloading...' : 'Download JSON'}
            </Button>
          </div>
        </div>

        {/* Workflow Info */}
        <Card className="glass border-primary/20 p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{workflow.name}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>Category: {workflow.category}</span>
                <span>•</span>
                <span>Created: {new Date(workflow.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={workflow.has_credentials ? "destructive" : "default"}>
                {workflow.has_credentials ? "Has Credentials" : "No Credentials"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Nodes:</span>
              <Badge variant="outline" className="border-primary/30">
                {workflow.node_count}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Complexity:</span>
              <Badge className={getComplexityColor(workflow.complexity)}>
                {workflow.complexity}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Size:</span>
              <Badge variant="outline" className="border-primary/30">
                {formatFileSize(workflow.size_bytes)}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Workflow Preview */}
        <Card className="glass border-primary/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Workflow Preview</h2>
            <div className="text-sm text-muted-foreground">
              {dataLoading ? 'Loading preview...' : 'Interactive • Zoom & Pan Enabled'}
            </div>
          </div>
          
          {workflowData ? (
            <N8nPreview workflow={workflowData} height="600px" />
          ) : dataLoading ? (
            <div className="bg-card rounded-lg border border-primary/20 p-12 text-center" style={{ height: '600px' }}>
              <div className="animate-pulse">
                <div className="text-muted-foreground mb-4">Loading workflow preview...</div>
                <div className="h-64 bg-muted rounded mx-auto max-w-md"></div>
              </div>
            </div>
          ) : previewError ? (
            <div className="bg-card rounded-lg border border-primary/20 p-12 text-center" style={{ height: '600px' }}>
              <div>
                <p className="text-red-400 mb-4">
                  Failed to load workflow preview
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Error: {previewError}
                </p>
                {workflow?.raw_url && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(workflow.raw_url, '_blank')}
                    className="glass border-primary/20 hover:border-primary/40 mb-2 mr-2"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Raw JSON
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="glass border-primary/20 hover:border-primary/40"
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-lg border border-primary/20 p-12 text-center" style={{ height: '600px' }}>
              <div>
                <p className="text-muted-foreground mb-4">
                  Preview not available for this workflow.
                </p>
                <p className="text-sm text-muted-foreground">
                  The workflow data could not be loaded from the source.
                </p>
              </div>
            </div>
          )}
          
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              This is a read-only preview. Click and drag to pan, scroll to zoom.
            </p>
            <Button
              variant="link" 
              className="text-accent hover:text-primary"
              asChild
            >
              <Link to="/workflows">
                <ExternalLink className="mr-2 h-4 w-4" />
                Browse More Workflows
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WorkflowDetail;