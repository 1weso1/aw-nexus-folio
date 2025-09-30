import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Sparkles, RefreshCw } from 'lucide-react';

const GenerateEmbeddings = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ processed: 0, successful: 0, failed: 0, totalSkipped: 0 });
  const [logs, setLogs] = useState<string[]>([]);

  const generateEmbeddings = async () => {
    setIsGenerating(true);
    setProgress(0);
    setStats({ processed: 0, successful: 0, failed: 0, totalSkipped: 0 });
    setLogs([]);
    
    let offset = 0;
    let hasMore = true;
    const batchSize = 50;

    try {
      while (hasMore) {
        const { data, error } = await supabase.functions.invoke('generate-embeddings', {
          body: { offset, limit: batchSize }
        });

        if (error) {
          throw error;
        }

        if (data?.success) {
          setStats(prev => ({
            processed: prev.processed + data.processed,
            successful: prev.successful + data.successful,
            failed: prev.failed + data.failed,
            totalSkipped: prev.totalSkipped + (data.totalSkipped || 0)
          }));

          const logMsg = `Batch ${Math.floor(offset / batchSize) + 1}: ${data.successful} successful, ${data.failed} failed`;
          setLogs(prev => [...prev, logMsg]);

          if (data.errors && data.errors.length > 0) {
            setLogs(prev => [...prev, ...data.errors.map((e: string) => `  ⚠️ ${e}`)]);
          }

          hasMore = data.hasMore;
          offset = data.nextOffset || offset + batchSize;
          
          // Update progress (estimate based on offset)
          setProgress(Math.min((offset / 2500) * 100, 95));
        } else {
          hasMore = false;
        }

        // Small delay between batches to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setProgress(100);
      toast({
        title: "Embeddings Generated",
        description: `Successfully generated ${stats.successful} embeddings. ${stats.totalSkipped} already existed.`,
      });
    } catch (error) {
      console.error('Error generating embeddings:', error);
      toast({
        title: "Error",
        description: `Failed to generate embeddings: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Generate Workflow Embeddings
          </CardTitle>
          <CardDescription>
            Generate AI embeddings for all workflows to enable semantic search.
            This will use Gemini (free until Oct 5) to create vector embeddings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-sm text-text-mid">
                  {isGenerating ? 'Generating embeddings...' : 'Ready to generate'}
                </p>
              </div>
              <Button 
                onClick={generateEmbeddings} 
                disabled={isGenerating}
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Embeddings
                  </>
                )}
              </Button>
            </div>

            {isGenerating && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-text-mid text-center">{Math.round(progress)}%</p>
              </div>
            )}

            {(stats.processed > 0 || stats.totalSkipped > 0) && (
              <div className="grid grid-cols-4 gap-4 p-4 bg-bg-card rounded-lg">
                <div>
                  <p className="text-sm text-text-mid">Processed</p>
                  <p className="text-2xl font-bold text-text-high">{stats.processed}</p>
                </div>
                <div>
                  <p className="text-sm text-text-mid">Successful</p>
                  <p className="text-2xl font-bold text-brand-primary">{stats.successful}</p>
                </div>
                <div>
                  <p className="text-sm text-text-mid">Failed</p>
                  <p className="text-2xl font-bold text-red-500">{stats.failed}</p>
                </div>
                <div>
                  <p className="text-sm text-text-mid">Already Exist</p>
                  <p className="text-2xl font-bold text-text-mid">{stats.totalSkipped}</p>
                </div>
              </div>
            )}

            {logs.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Generation Log</p>
                <div className="bg-bg-card rounded-lg p-4 max-h-64 overflow-y-auto space-y-1">
                  {logs.map((log, idx) => (
                    <p key={idx} className="text-sm font-mono text-text-mid">{log}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t pt-4 space-y-2">
            <p className="text-sm font-medium">Important Notes:</p>
            <ul className="text-sm text-text-mid space-y-1 list-disc list-inside">
              <li>This will generate embeddings for all workflows that don't have them yet</li>
              <li>Gemini API is free until October 5th - generate embeddings now!</li>
              <li>Embeddings are stored permanently and don't need regeneration</li>
              <li>This enables semantic search on the /workflows page</li>
              <li>Process runs in batches of 50 workflows at a time</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GenerateEmbeddings;
