import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const TestOllamaEmbeddings = () => {
  const [testing, setTesting] = useState(false);
  const [testText, setTestText] = useState("Hello world");
  const [result, setResult] = useState<any>(null);

  const runTest = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('test-ollama-embeddings', {
        body: { testText }
      });

      if (error) {
        toast.error(`Function error: ${error.message}`);
        setResult({ error: error.message });
      } else {
        setResult(data);
        if (data.success) {
          toast.success("Test successful!");
        } else {
          toast.error("Test failed - check results below");
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      toast.error(`Error: ${errorMsg}`);
      setResult({ error: errorMsg });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="p-6">
        <h1 className="text-3xl font-bold mb-4">Test Ollama Cloud Embeddings</h1>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Test Text</label>
            <Input
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Enter text to generate embedding"
            />
          </div>

          <Button 
            onClick={runTest}
            disabled={testing}
            size="lg"
          >
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Run Test"
            )}
          </Button>
        </div>

        {result && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-3">Result:</h2>
            <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>

            {result.success === false && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
                <h3 className="font-semibold text-destructive mb-2">Debugging Info:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Check that OLLAMA_API_KEY is set correctly in Supabase secrets</li>
                  <li>Check that OLLAMA_CLOUD_ENDPOINT is set to: https://ollama.com</li>
                  <li>Verify your API key at: <a href="https://ollama.com/settings/keys" target="_blank" rel="noopener noreferrer" className="underline">https://ollama.com/settings/keys</a></li>
                  <li>Check edge function logs for detailed error messages</li>
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Configuration Check:</h3>
          <ul className="text-sm space-y-1">
            <li>• OLLAMA_CLOUD_ENDPOINT should be: <code className="bg-background px-1 rounded">https://ollama.com</code></li>
            <li>• OLLAMA_API_KEY should be from: <a href="https://ollama.com/settings/keys" target="_blank" rel="noopener noreferrer" className="underline">ollama.com/settings/keys</a></li>
            <li>• Model: <code className="bg-background px-1 rounded">deepseek-v3.1:671b-cloud</code></li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default TestOllamaEmbeddings;
