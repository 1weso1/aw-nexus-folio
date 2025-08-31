import JSZip from 'jszip';
import type { WorkflowItem } from '@/types/workflow';

interface ZipRequest {
  ids: string[];
  workflows: WorkflowItem[];
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body: ZipRequest = await request.json();
    const { ids, workflows } = body;

    // Validate request
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return new Response(JSON.stringify({ error: 'No workflows selected' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (ids.length > 200) {
      return new Response(JSON.stringify({ error: 'Maximum 200 workflows allowed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const zip = new JSZip();
    const errors: string[] = [];
    let totalSize = 0;
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB limit

    // Download and add each workflow to the zip
    for (const workflow of workflows) {
      if (!ids.includes(workflow.id)) continue;

      try {
        console.log(`Downloading workflow: ${workflow.name} from ${workflow.rawUrl}`);
        
        const response = await fetch(workflow.rawUrl);
        if (!response.ok) {
          errors.push(`Failed to download ${workflow.name}: ${response.status} ${response.statusText}`);
          continue;
        }

        const content = await response.text();
        const contentSize = new Blob([content]).size;

        // Check size limit
        if (totalSize + contentSize > MAX_SIZE) {
          errors.push(`Size limit exceeded. Skipping remaining workflows.`);
          break;
        }

        totalSize += contentSize;

        // Create safe filename
        const safeFileName = `${workflow.name.replace(/[^a-z0-9\-_\s]/gi, '').replace(/\s+/g, '-')}.json`;
        const folderName = workflow.category.replace(/[^a-z0-9\-_\s]/gi, '').replace(/\s+/g, '-');
        
        // Add to zip with folder structure
        zip.folder(folderName)?.file(safeFileName, content);

      } catch (error) {
        console.error(`Error processing workflow ${workflow.name}:`, error);
        errors.push(`Failed to process ${workflow.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Add a README file with information
    const readmeContent = `# n8n Workflows Collection

Downloaded on: ${new Date().toISOString()}
Total workflows: ${workflows.length}
${errors.length > 0 ? `\nErrors encountered:\n${errors.map(e => `- ${e}`).join('\n')}` : ''}

## How to Import

1. Open your n8n instance
2. Go to Workflows
3. Click "Import from file"
4. Select the .json files from this archive
5. Configure any required credentials

## Need Help?

Visit: https://ahmedwesam.com/contact
`;

    zip.file('README.md', readmeContent);

    // Generate the zip file
    console.log('Generating ZIP file...');
    const zipBlob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    // Create filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `n8n-workflows-${timestamp}.zip`;

    console.log(`ZIP file generated successfully. Size: ${zipBlob.size} bytes`);

    return new Response(zipBlob, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': zipBlob.size.toString(),
      }
    });

  } catch (error) {
    console.error('ZIP generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate ZIP file',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle the request based on method
export default async function handler(request: Request) {
  if (request.method === 'POST') {
    return POST(request);
  }
  
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}