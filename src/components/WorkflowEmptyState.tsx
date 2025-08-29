import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, Zap } from 'lucide-react';

interface WorkflowEmptyStateProps {
  onSync: () => void;
  isSyncing: boolean;
  syncResult?: { success: boolean; message: string; processed?: number; errors?: number } | null;
}

export const WorkflowEmptyState: React.FC<WorkflowEmptyStateProps> = ({
  onSync,
  isSyncing,
  syncResult
}) => {
  return (
    <div className="text-center py-16 max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-primary/10 rounded-full mb-6">
          <Database className="h-10 w-10 text-brand-primary" />
        </div>
        
        <h2 className="text-3xl font-bold text-text-high mb-4">
          No workflows yet
        </h2>
        
        <p className="text-text-mid text-lg mb-8 leading-relaxed">
          Click 'Sync Now' to import thousands of ready-to-use n8n workflows from the community repository. 
          This includes workflows for HubSpot, Google Sheets, Telegram, Slack, and many more integrations.
        </p>
      </div>

      <div className="space-y-4">
        <Button 
          onClick={onSync} 
          disabled={isSyncing}
          size="lg"
          className="px-8 py-3 text-lg"
        >
          <RefreshCw className={`h-5 w-5 mr-3 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing Workflows...' : 'Sync Now'}
        </Button>

        {isSyncing && (
          <div className="bg-bg-card border border-border-subtle rounded-lg p-4 text-sm text-text-mid">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="h-4 w-4 animate-pulse text-brand-primary" />
              <span>Importing workflows from GitHub...</span>
            </div>
            <p>This may take a few moments to complete.</p>
          </div>
        )}

        {syncResult && (
          <div className={`p-4 rounded-lg ${syncResult.success 
            ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}>
            <div className="font-medium mb-1">{syncResult.message}</div>
            {syncResult.processed && (
              <div className="text-sm opacity-80">
                Successfully processed: {syncResult.processed} workflows
                {syncResult.errors && syncResult.errors > 0 && (
                  <span> • Errors: {syncResult.errors}</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-12 text-sm text-text-mid">
        <p>Workflows will be sourced from the community repository:</p>
        <a 
          href="https://github.com/zie619/n8n-workflows" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-brand-primary hover:text-brand-accent transition-colors"
        >
          github.com/zie619/n8n-workflows
        </a>
      </div>
    </div>
  );
};