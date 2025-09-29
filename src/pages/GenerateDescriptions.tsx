import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const GenerateDescriptions = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
  });
  const [existingCount, setExistingCount] = useState(0);
  const [totalWorkflows, setTotalWorkflows] = useState(0);

  // Check existing progress on mount
  useEffect(() => {
    const checkProgress = async () => {
      const { count: workflowCount } = await supabase
        .from('workflows')
        .select('*', { count: 'exact', head: true });
      
      const { count: descriptionCount } = await supabase
        .from('workflow_descriptions')
        .select('*', { count: 'exact', head: true });
      
      setTotalWorkflows(workflowCount || 0);
      setExistingCount(descriptionCount || 0);
    };
    
    checkProgress();
  }, []);

  const startGeneration = async () => {
    console.log('🚀 START GENERATION CLICKED');
    console.log(`📊 Starting from existing ${existingCount} descriptions out of ${totalWorkflows} total`);
    setIsGenerating(true);
    setProgress((existingCount / totalWorkflows) * 100);
    
    // Start from the next batch after existing descriptions
    let offset = existingCount;
    const limit = 10;
    let hasMore = true;
    let consecutiveEmptyBatches = 0;
    
    const totalStats = {
      processed: 0,
      success: 0,
      failed: 0,
    };

    try {
      while (hasMore && consecutiveEmptyBatches < 5) {
        console.log(`📦 Processing batch at offset ${offset}`);
        
        const { data, error } = await supabase.functions.invoke('generate-workflow-descriptions', {
          body: { offset, limit }
        });

        if (error) {
          console.error('❌ Error:', error);
          toast.error(`Batch failed: ${error.message}`);
          break;
        }

        console.log('✅ Batch result:', data);
        
        // If we processed 0 workflows, this batch is done, try next batch
        if (data.processed === 0) {
          consecutiveEmptyBatches++;
          offset += limit;
          console.log(`⏭️ Empty batch, moving to offset ${offset}`);
          continue;
        }

        consecutiveEmptyBatches = 0;
        totalStats.processed += data.processed || 0;
        totalStats.success += data.success || 0;
        totalStats.failed += data.failed || 0;

        const currentTotal = existingCount + totalStats.processed;
        setStats({
          ...totalStats,
          total: totalWorkflows,
          processed: currentTotal,
        });

        // Calculate progress percentage
        const progressPercent = Math.min(100, (currentTotal / totalWorkflows) * 100);
        setProgress(progressPercent);

        if (data.errors && data.errors.length > 0) {
          console.warn('⚠️ Batch errors:', data.errors);
        }

        offset = data.nextOffset || offset + limit;

        // Check if we've reached the end
        if (offset >= totalWorkflows) {
          hasMore = false;
        }

        // Add a small delay between batches to avoid rate limits
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Refresh counts
      const { count: newDescriptionCount } = await supabase
        .from('workflow_descriptions')
        .select('*', { count: 'exact', head: true });
      setExistingCount(newDescriptionCount || 0);

      toast.success(`Generation complete! ${totalStats.success} new descriptions generated, ${totalStats.failed} failed.`);
    } catch (error) {
      console.error('❌ Generation error:', error);
      toast.error('Generation failed. Check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="glass border-brand-primary/20 p-8">
          <h1 className="text-3xl font-bold text-text-high mb-4">
            Generate Workflow Descriptions
          </h1>
          
          <p className="text-text-mid mb-4">
            This tool uses AI to generate detailed descriptions, use cases, and setup guides for all {totalWorkflows} workflows.
          </p>
          
          {totalWorkflows > 0 && (
            <div className="mb-6 p-4 rounded-lg bg-accent/10 border border-accent/20">
              <h3 className="text-lg font-semibold text-text-high mb-2">Current Progress</h3>
              <p className="text-sm text-text-mid">
                ✅ {existingCount} descriptions already generated<br/>
                ⏳ {totalWorkflows - existingCount} remaining workflows
              </p>
              {existingCount > 0 && (
                <p className="text-xs text-text-mid mt-2">
                  Click "Continue Generation" to resume from where you left off.
                </p>
              )}
            </div>
          )}

          <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Free During Promotion Period</h3>
            <p className="text-sm text-text-mid">
              All Gemini models are free to use until Oct 6, 2025. Run this now to generate all descriptions for free!
            </p>
          </div>

          {isGenerating && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-mid">Progress</span>
                <span className="text-sm font-semibold text-text-high">
                  {stats.processed} / 2,046 workflows
                </span>
              </div>
              <Progress value={progress} className="mb-4" />
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-400">{stats.success}</div>
                  <div className="text-xs text-text-mid">Success</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">{stats.failed}</div>
                  <div className="text-xs text-text-mid">Failed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">{Math.round(progress)}%</div>
                  <div className="text-xs text-text-mid">Complete</div>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={startGeneration}
            disabled={isGenerating || (existingCount >= totalWorkflows && totalWorkflows > 0)}
            className="w-full bg-gradient-to-r from-brand-primary to-brand-accent hover:opacity-90"
          >
            {isGenerating ? 'Generating...' : existingCount > 0 ? 'Continue Generation' : 'Start Generation'}
          </Button>
          
          {existingCount >= totalWorkflows && totalWorkflows > 0 && (
            <p className="text-sm text-green-400 text-center mt-2">
              ✅ All workflows have descriptions!
            </p>
          )}

          <div className="mt-6 p-4 rounded-lg bg-card border border-border">
            <h3 className="text-sm font-semibold text-text-high mb-2">What happens during generation:</h3>
            <ul className="text-sm text-text-mid space-y-1 list-disc list-inside">
              <li>Fetches workflows in batches of 10</li>
              <li>Analyzes each workflow's structure and nodes</li>
              <li>Generates AI description using Gemini 2.5 Flash</li>
              <li>Stores descriptions in database</li>
              <li>Updates workflow detail pages automatically</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GenerateDescriptions;