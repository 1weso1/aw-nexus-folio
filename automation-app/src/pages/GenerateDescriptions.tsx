import { useState } from "react";
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
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    total: number;
    matched: number;
    mismatched: number;
    mismatchDetails?: string[];
    confidence: number;
  } | null>(null);

  const startGeneration = async () => {
    setIsGenerating(true);
    setProgress(0);
    
    let offset = 0;
    const limit = 10; // Process 10 workflows at a time
    let hasMore = true;
    
    const totalStats = {
      processed: 0,
      success: 0,
      failed: 0,
    };

    try {
      while (hasMore) {
        console.log(`Processing batch at offset ${offset}`);
        
        const { data, error } = await supabase.functions.invoke('generate-workflow-descriptions', {
          body: { offset, limit }
        });

        if (error) {
          console.error('Error:', error);
          toast.error(`Batch failed: ${error.message}`);
          break;
        }

        console.log('Batch result:', data);
        
        totalStats.processed += data.processed || 0;
        totalStats.success += data.success || 0;
        totalStats.failed += data.failed || 0;

        setStats({
          ...totalStats,
          total: 2046, // Total workflows
        });

        // Calculate progress percentage
        const progressPercent = Math.min(100, (totalStats.processed / 2046) * 100);
        setProgress(progressPercent);

        if (data.errors && data.errors.length > 0) {
          console.warn('Batch errors:', data.errors);
        }

        // Check if there are more workflows to process
        hasMore = data.hasMore && totalStats.processed < 2046;
        offset = data.nextOffset || offset + limit;

        // Add a small delay between batches to avoid rate limits
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      toast.success(`Generation complete! ${totalStats.success} descriptions generated, ${totalStats.failed} failed.`);
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Generation failed. Check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  const verifyDescriptions = async () => {
    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-workflow-descriptions');
      
      if (error) {
        toast.error('Verification failed: ' + error.message);
        return;
      }

      setVerificationResult(data);
      
      if (data.confidence >= 90) {
        toast.success(`Verification passed! ${data.confidence}% confidence based on ${data.total} samples.`);
      } else if (data.confidence >= 70) {
        toast.info(`Good match! ${data.confidence}% confidence. ${data.mismatched} potential issues found.`);
      } else {
        toast.warning(`Verification concerns: ${data.confidence}% confidence. Found ${data.mismatched} mismatches.`);
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Verification failed. Check console for details.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="glass border-brand-primary/20 p-8">
          <h1 className="text-3xl font-bold text-text-high mb-4">
            Generate Workflow Descriptions
          </h1>
          
          <p className="text-text-mid mb-6">
            This tool uses AI to generate detailed descriptions, use cases, and setup guides for all 2,046 workflows.
            The process will take approximately 30-40 minutes to complete.
          </p>

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

          <div className="space-y-3">
            <Button
              onClick={startGeneration}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-brand-primary to-brand-accent hover:opacity-90"
            >
              {isGenerating ? 'Generating...' : 'Start Generation'}
            </Button>

            <Button
              onClick={verifyDescriptions}
              disabled={verifying || isGenerating}
              variant="outline"
              className="w-full"
            >
              {verifying ? 'Verifying...' : 'Verify Descriptions'}
            </Button>
          </div>

          {verificationResult && (
            <div className="mt-4 p-4 rounded-lg bg-card border border-border space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-text-high mb-2">Deep Verification Results:</h3>
                <div className="grid grid-cols-4 gap-4 text-center mb-4">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{verificationResult.total}</div>
                    <div className="text-xs text-text-mid">Sampled</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">{verificationResult.matched}</div>
                    <div className="text-xs text-text-mid">Matched</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">{verificationResult.mismatched}</div>
                    <div className="text-xs text-text-mid">Mismatched</div>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${
                      verificationResult.confidence >= 90 ? 'text-green-400' : 
                      verificationResult.confidence >= 70 ? 'text-yellow-400' : 
                      'text-red-400'
                    }`}>
                      {verificationResult.confidence}%
                    </div>
                    <div className="text-xs text-text-mid">Confidence</div>
                  </div>
                </div>
              </div>
              
              {verificationResult.mismatchDetails && verificationResult.mismatchDetails.length > 0 && (
                <div className="border-t border-border pt-3">
                  <h4 className="text-xs font-semibold text-text-high mb-2">Issues Found:</h4>
                  <ul className="text-xs text-text-mid space-y-1">
                    {verificationResult.mismatchDetails.map((detail, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-red-400 mr-2">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="border-t border-border pt-3">
                <p className="text-xs text-text-mid">
                  This verification fetches actual workflow JSON and checks if services mentioned in descriptions 
                  actually exist in the workflows. It also detects hallucinated services.
                </p>
              </div>
            </div>
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