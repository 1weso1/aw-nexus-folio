import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Download, ExternalLink, Lock } from "lucide-react";
import { toast } from "sonner";
import N8nPreview from "@/components/N8nPreview";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { LeadCaptureDialog } from "@/components/LeadCaptureDialog";
import { VerificationReminderDialog } from "@/components/VerificationReminderDialog";
import { LimitReachedDialog } from "@/components/LimitReachedDialog";
import { UpgradeDialog } from "@/components/UpgradeDialog";

// Remove old n8n-demo declarations as we're using React Flow now

interface Workflow {
  id: string;
  name: string;
  category: string;
  node_count: number;
  has_credentials: boolean;
  raw_url: string;
  complexity: string;
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

interface WorkflowDescription {
  description: string;
  use_cases: string | null;
  setup_guide: string | null;
}

const WorkflowDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [workflowData, setWorkflowData] = useState<WorkflowData | null>(null);
  const [workflowDescription, setWorkflowDescription] = useState<WorkflowDescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  
  // Download and tier management state
  const [showLeadCaptureDialog, setShowLeadCaptureDialog] = useState(false);
  const [showVerificationReminder, setShowVerificationReminder] = useState(false);
  const [showLimitReached, setShowLimitReached] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [downloadsRemaining, setDownloadsRemaining] = useState(10);
  const [downloadsUsed, setDownloadsUsed] = useState(0);
  const [downloadLimit, setDownloadLimit] = useState(10);
  const [userAccessTier, setUserAccessTier] = useState<'free' | 'gold' | 'platinum'>('free');
  const [canAccessExpert, setCanAccessExpert] = useState(false);
  const [canAccessEnterprise, setCanAccessEnterprise] = useState(false);

  // Check download status on mount
  const checkDownloadStatus = async () => {
    const storedEmail = localStorage.getItem('lead_email');
    if (!storedEmail) return;

    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();

      const { data: eligibilityData, error } = await supabase.rpc(
        'check_download_eligibility',
        {
          p_email: storedEmail,
          p_ip_address: ip || null,
        }
      );

      if (!error && eligibilityData && eligibilityData[0]) {
        const eligibility = eligibilityData[0];
        setDownloadsRemaining(eligibility.downloads_remaining);
        setDownloadsUsed(eligibility.downloads_used);
        setDownloadLimit(eligibility.downloads_used + eligibility.downloads_remaining);
        setUserAccessTier((eligibility.access_tier as 'free' | 'gold' | 'platinum') || 'free');
        setCanAccessExpert(eligibility.can_access_expert || false);
        setCanAccessEnterprise(eligibility.can_access_enterprise || false);
      }
    } catch (error) {
      console.error('Error checking download status:', error);
    }
  };

  useEffect(() => {
    if (!id) return;
    
    const fetchWorkflow = async () => {
      try {
        console.log('Fetching workflow with ID:', id);
        
        const response = await fetch(
          `https://ugjeubqwmgnqvohmrkyv.supabase.co/rest/v1/workflows?select=id,name,category,node_count,has_credentials,raw_url,complexity&id=eq.${id}`,
          {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnamV1YnF3bWducXZvaG1ya3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0Nzc5NDEsImV4cCI6MjA3MjA1Mzk0MX0.esXYyxM-eQbKBXhG2NKrzLsdiveNo4lBsK_rlv_ebjo',
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnamV1YnF3bWducXZvaG1ya3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0Nzc5NDEsImV4cCI6MjA3MjA1Mzk0MX0.esXYyxM-eQbKBXhG2NKrzLsdiveNo4lBsK_rlv_ebjo`
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch workflow: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Workflow metadata response:', data);
        
        if (data.length === 0) {
          console.error('Workflow not found');
          toast.error("Workflow not found");
          return;
        }

        const workflowInfo = data[0];
        console.log('Workflow info:', workflowInfo);
        setWorkflow(workflowInfo);
        
        // Fetch the actual workflow JSON data
        if (workflowInfo.raw_url) {
          console.log('Fetching workflow JSON from:', workflowInfo.raw_url);
          setDataLoading(true);
          setPreviewError(null);
          
          try {
            const workflowResponse = await fetch(workflowInfo.raw_url);
            console.log('Workflow JSON response status:', workflowResponse.status);
            
            if (workflowResponse.ok) {
              const workflowJson = await workflowResponse.json();
              console.log('Workflow JSON data:', workflowJson);
              console.log('Workflow has nodes:', !!workflowJson?.nodes);
              console.log('Node count:', workflowJson?.nodes?.length);
              
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
            toast.error("Failed to load workflow preview");
          } finally {
            setDataLoading(false);
          }
        } else {
          console.warn('No raw_url provided for workflow');
          setPreviewError('No workflow data URL available');
        }

        // Fetch AI-generated description
        const { data: descriptionData } = await supabase
          .from('workflow_descriptions')
          .select('description, use_cases, setup_guide')
          .eq('workflow_id', id)
          .maybeSingle();

        if (descriptionData) {
          setWorkflowDescription(descriptionData);
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
    checkDownloadStatus();
  }, [id]);

  const getComplexityColor = (complexity: string, nodeCount: number) => {
    const enhancedComplexity = getEnhancedComplexity(nodeCount);
    if (enhancedComplexity === 'low') return "bg-green-500/20 text-green-400 border-green-500/30";
    if (enhancedComplexity === 'medium') return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  const getEnhancedComplexity = (nodeCount: number) => {
    if (nodeCount <= 5) return 'low';
    if (nodeCount <= 15) return 'medium';
    return 'high';
  };

  const getComplexityLabel = (nodeCount: number) => {
    const complexity = getEnhancedComplexity(nodeCount);
    return complexity.charAt(0).toUpperCase() + complexity.slice(1);
  };

  const getTriggerType = (workflow: Workflow) => {
    // Simple heuristic based on category or name
    if (workflow.name.toLowerCase().includes('webhook')) return "Webhook";
    if (workflow.name.toLowerCase().includes('manual')) return "Manual";
    if (workflow.name.toLowerCase().includes('schedule')) return "Scheduled";
    if (workflow.node_count === 1) return "Manual";
    if (workflow.node_count > 10) return "Complex";
    return "Simple";
  };

  const getGranularComplexity = (nodeCount: number): 'starter' | 'basic' | 'intermediate' | 'advanced' | 'expert' | 'enterprise' => {
    if (nodeCount <= 5) return 'starter';
    if (nodeCount <= 15) return 'basic';
    if (nodeCount <= 30) return 'intermediate';
    if (nodeCount <= 50) return 'advanced';
    if (nodeCount <= 70) return 'expert';
    return 'enterprise';
  };

  const canDownloadWorkflow = (complexity: string): boolean => {
    if (complexity === 'expert') return canAccessExpert;
    if (complexity === 'enterprise') return canAccessEnterprise;
    return true;
  };

  const isWorkflowLocked = (complexity: string): boolean => {
    return !canDownloadWorkflow(complexity);
  };

  const getRequiredTierForComplexity = (complexity: string): 'gold' | 'platinum' | null => {
    if (complexity === 'expert') return 'gold';
    if (complexity === 'enterprise') return 'platinum';
    return null;
  };

  const performDownload = async (workflow: Workflow) => {
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
    
    toast.success(`Downloaded ${workflow.name}`);
  };

  const downloadWorkflow = async () => {
    if (!workflow) return;

    try {
      const storedEmail = localStorage.getItem('lead_email');
      const hasDownloaded = localStorage.getItem('has_downloaded');
      
      const enhancedComplexity = getGranularComplexity(workflow.node_count);
      if (!canDownloadWorkflow(enhancedComplexity)) {
        setShowUpgradeDialog(true);
        return;
      }
      
      if (hasDownloaded === 'true' && storedEmail) {
        const { data: eligibilityData, error: eligibilityError } = await supabase.rpc(
          'check_download_eligibility',
          {
            p_email: storedEmail,
            p_ip_address: null,
          }
        );

        if (eligibilityError) throw eligibilityError;

        const eligibility = eligibilityData[0];
        
        if (eligibility.requires_verification) {
          setShowVerificationReminder(true);
          return;
        }
        
        if (!eligibility.can_download) {
          setShowLimitReached(true);
          return;
        }
        
        await performDownload(workflow);
        
        const { error: downloadError } = await supabase.from('workflow_downloads').insert({
          lead_email: storedEmail,
          workflow_id: workflow.id,
          user_agent: navigator.userAgent,
        } as any);

        if (downloadError) console.error('Error tracking download:', downloadError);

        const { data: incrementData, error: incrementError } = await supabase.functions.invoke(
          'increment-download-count',
          {
            body: { email: storedEmail }
          }
        );

        if (incrementError) {
          console.error('Error incrementing download count:', incrementError);
        } else if (incrementData) {
          console.log('Download count incremented:', incrementData);
        }
        
        setDownloadsRemaining(eligibility.downloads_remaining - 1);
        setDownloadsUsed(eligibility.downloads_used + 1);
        return;
      }
      
      if (!storedEmail) {
        await performDownload(workflow);
        localStorage.setItem('has_downloaded', 'true');
        setShowLeadCaptureDialog(true);
        return;
      }
    } catch (error) {
      console.error('Error downloading workflow:', error);
      toast.error("Failed to download workflow");
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
            onClick={() => navigate(-1)}
            className="mb-8 text-text-mid hover:text-text-high"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Workflows
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-high mb-4">Workflow Not Found</h1>
            <p className="text-text-mid">The workflow you're looking for doesn't exist.</p>
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
            onClick={() => navigate(-1)}
            className="text-text-mid hover:text-text-high"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Workflows
          </Button>
        </div>

        {/* Workflow Info */}
        <Card className="glass border-brand-primary/20 p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-text-high mb-2">{workflow.name}</h1>
              <div className="flex items-center gap-3 text-sm text-text-mid">
                <span>ID: {workflow.id}</span>
                <span>•</span>
                <span>Category: {workflow.category}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant={workflow.has_credentials ? "destructive" : "default"}>
                {workflow.has_credentials ? "Has Credentials" : "No Credentials"}
              </Badge>
              
              {(() => {
                const enhancedComplexity = getGranularComplexity(workflow.node_count);
                const locked = isWorkflowLocked(enhancedComplexity);
                const requiredTier = getRequiredTierForComplexity(enhancedComplexity);
                
                return (
                  <Button
                    onClick={downloadWorkflow}
                    className={locked ? 
                      "gradient-primary hover:shadow-lg transition-all duration-300" : 
                      "gradient-primary hover:shadow-lg transition-all duration-300"
                    }
                    size="default"
                  >
                    {locked ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        {requiredTier === 'gold' ? '👑 Gold' : '💎 Platinum'} Required
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </>
                    )}
                  </Button>
                );
              })()}
            </div>
          </div>

          {workflowDescription && (
            <div className="mb-6 pb-6 border-b border-brand-primary/20">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="description" className="border-brand-primary/20">
                  <AccordionTrigger className="text-xl font-semibold text-text-high hover:text-brand-accent">
                    Description
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="prose prose-lg max-w-none [&>*]:text-text-mid [&_strong]:text-text-high [&_strong]:font-semibold [&_ol]:space-y-2 [&_ul]:space-y-2 [&_li]:text-text-mid [&_p]:text-text-mid [&_h3]:text-text-high [&_h3]:font-semibold [&_code]:text-brand-accent [&_code]:bg-brand-primary/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono pt-2">
                      <ReactMarkdown>{workflowDescription.description}</ReactMarkdown>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {workflowDescription.use_cases && (
                  <AccordionItem value="use-cases" className="border-brand-primary/20">
                    <AccordionTrigger className="text-xl font-semibold text-text-high hover:text-brand-accent">
                      Use Cases
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="prose prose-lg max-w-none [&>*]:text-text-mid [&_strong]:text-text-high [&_strong]:font-semibold [&_ol]:space-y-2 [&_ul]:space-y-2 [&_li]:text-text-mid [&_p]:text-text-mid [&_h3]:text-text-high [&_h3]:font-semibold [&_code]:text-brand-accent [&_code]:bg-brand-primary/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono pt-2">
                        <ReactMarkdown>{workflowDescription.use_cases}</ReactMarkdown>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {workflowDescription.setup_guide && (
                  <AccordionItem value="setup-guide" className="border-brand-primary/20">
                    <AccordionTrigger className="text-xl font-semibold text-text-high hover:text-brand-accent">
                      Setup Guide
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="prose prose-lg max-w-none [&>*]:text-text-mid [&_strong]:text-text-high [&_strong]:font-semibold [&_ol]:space-y-2 [&_ul]:space-y-2 [&_li]:text-text-mid [&_p]:text-text-mid [&_h3]:text-text-high [&_h3]:font-semibold [&_code]:text-brand-accent [&_code]:bg-brand-primary/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono pt-2">
                        <ReactMarkdown>{workflowDescription.setup_guide}</ReactMarkdown>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-text-mid">Nodes:</span>
              <Badge variant="outline" className="border-brand-accent/30">
                {workflow.node_count}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-text-mid">Type:</span>
              <Badge variant="outline" className="border-brand-accent/30">
                {getTriggerType(workflow)}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-text-mid">Complexity:</span>
              <Badge className={getComplexityColor(workflow.complexity, workflow.node_count)}>
                {getComplexityLabel(workflow.node_count)}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Workflow Preview */}
        <Card className="glass border-brand-primary/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-high">Workflow Preview</h2>
            <div className="text-sm text-text-mid">
              {dataLoading ? 'Loading preview...' : 'Interactive • Zoom & Pan Enabled'}
            </div>
          </div>
          
          {workflowData ? (
            <N8nPreview workflow={workflowData} height="600px" />
          ) : dataLoading ? (
            <div className="bg-card rounded-lg border border-brand-primary/20 p-12 text-center" style={{ height: '600px' }}>
              <div className="animate-pulse">
                <div className="text-text-mid mb-4">Loading workflow preview...</div>
                <div className="h-64 bg-muted rounded mx-auto max-w-md"></div>
              </div>
            </div>
          ) : previewError ? (
            <div className="bg-card rounded-lg border border-brand-primary/20 p-12 text-center" style={{ height: '600px' }}>
              <div>
                <p className="text-red-400 mb-4">
                  Failed to load workflow preview
                </p>
                <p className="text-sm text-text-mid mb-4">
                  Error: {previewError}
                </p>
                {workflow?.raw_url && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(workflow.raw_url, '_blank')}
                    className="glass border-brand-primary/20 hover:border-brand-primary/40 mb-2 mr-2"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Raw JSON
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="glass border-brand-primary/20 hover:border-brand-primary/40"
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-lg border border-brand-primary/20 p-12 text-center" style={{ height: '600px' }}>
              <div>
                <p className="text-text-mid mb-4">
                  Preview not available for this workflow.
                </p>
                <p className="text-sm text-text-mid">
                  The workflow data could not be loaded from the source.
                </p>
              </div>
            </div>
          )}
          
          <div className="mt-4 text-center">
            <p className="text-sm text-text-mid mb-2">
              This is a read-only preview. Click and drag to pan, scroll to zoom.
            </p>
            <Button
              variant="link" 
              className="text-brand-accent hover:text-brand-primary"
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

      {/* Download Dialogs */}
      <LeadCaptureDialog
        open={showLeadCaptureDialog}
        onClose={() => setShowLeadCaptureDialog(false)}
        workflowId={workflow?.id}
        workflowName={workflow?.name}
        onSuccess={() => {
          toast.success("Check your email to verify and unlock 9 more downloads.");
        }}
      />

      <VerificationReminderDialog
        open={showVerificationReminder}
        onClose={() => setShowVerificationReminder(false)}
        email={localStorage.getItem('lead_email') || ''}
        workflowId={workflow?.id}
        workflowName={workflow?.name}
      />

      <LimitReachedDialog
        open={showLimitReached}
        onClose={() => setShowLimitReached(false)}
        downloadsUsed={downloadsUsed}
        accessTier={userAccessTier}
      />

      <UpgradeDialog
        open={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        workflowName={workflow?.name || ''}
        requiredTier={workflow ? getRequiredTierForComplexity(getGranularComplexity(workflow.node_count)) || 'gold' : 'gold'}
        currentTier={userAccessTier}
        workflowComplexity={workflow ? getComplexityLabel(workflow.node_count) : ''}
      />
    </div>
  );
};

export default WorkflowDetail;