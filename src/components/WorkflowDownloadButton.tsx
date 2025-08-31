import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowDownloadButtonProps {
  workflowId: string;
  workflowName: string;
  downloadUrl: string;
  folderName: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showPreview?: boolean;
}

export const WorkflowDownloadButton: React.FC<WorkflowDownloadButtonProps> = ({
  workflowId,
  workflowName,
  downloadUrl,
  folderName,
  variant = 'default',
  size = 'default',
  showPreview = false
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Generate the direct download URL for the specific workflow JSON
      const jsonUrl = `${downloadUrl}${workflowName.replace(/\s+/g, '_')}.json`;
      
      // Create a temporary link element to trigger download
      const link = document.createElement('a');
      link.href = jsonUrl;
      link.download = `${workflowName.replace(/\s+/g, '_')}.json`;
      link.target = '_blank';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Downloaded ${workflowName} successfully!`);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open the folder URL in a new tab
      window.open(downloadUrl, '_blank');
      toast.info(`Opening ${folderName} folder. Please select the workflow you want to download.`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreview = () => {
    // Open the GitHub folder view in a new tab
    const githubUrl = downloadUrl.replace('raw.githubusercontent.com', 'github.com').replace('/main/', '/tree/main/');
    window.open(githubUrl, '_blank');
    toast.info(`Opening ${folderName} workflows in GitHub`);
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