import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowDownloadButtonProps {
  workflowId: string;
  workflowName: string;
  rawUrl: string; // Direct GitHub raw URL
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showPreview?: boolean;
}

export const WorkflowDownloadButton: React.FC<WorkflowDownloadButtonProps> = ({
  workflowId,
  workflowName,
  rawUrl,
  variant = 'default',
  size = 'default',
  showPreview = false
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Fetch the workflow JSON from the raw URL
      const response = await fetch(rawUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch workflow: ${response.status}`);
      }
      
      const workflowJson = await response.text();
      
      // Create blob and download
      const blob = new Blob([workflowJson], { type: 'application/json' });
      const downloadUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${workflowId}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(downloadUrl);
      
      toast.success(`Downloaded ${workflowName} successfully!`);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open raw URL in new tab
      window.open(rawUrl, '_blank');
      toast.info(`Opening workflow JSON. Right-click and save to download.`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreview = () => {
    // Convert raw URL to GitHub file view
    const githubUrl = rawUrl.replace('raw.githubusercontent.com', 'github.com').replace('/main/', '/blob/main/');
    window.open(githubUrl, '_blank');
    toast.info('Opening workflow on GitHub');
  };

  const handleViewRepository = () => {
    window.open('https://github.com/Zie619/n8n-workflows', '_blank');
    toast.info('Opening n8n workflows repository');
  };

  if (showPreview) {
    return (
      <div className="flex gap-2">
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          variant={variant}
          size={size}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {isDownloading ? 'Downloading...' : 'Download JSON'}
        </Button>
        
        <Button
          onClick={handlePreview}
          variant="outline"
          size={size}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          Preview
        </Button>
        
        <Button
          onClick={handleViewRepository}
          variant="ghost"
          size={size}
          className="flex items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Repository
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading}
      variant={variant}
      size={size}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      {isDownloading ? 'Downloading...' : 'Download JSON'}
    </Button>
  );
};

export default WorkflowDownloadButton;