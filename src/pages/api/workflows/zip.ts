import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';

export interface ZipRequest {
  workflowIds: string[];
}

export async function POST(request: Request): Promise<Response> {
  try {
    const { workflowIds }: ZipRequest = await request.json();

    if (!workflowIds || !Array.isArray(workflowIds) || workflowIds.length === 0) {
      return new Response(JSON.stringify({ error: 'No workflows selected' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (workflowIds.length > 50) {
      return new Response(JSON.stringify({ error: 'Maximum 50 workflows allowed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch workflows from Supabase
    const { data: workflows, error } = await supabase
      .from('workflows')
      .select('slug, name, raw_url, category')
      .in('slug', workflowIds);

    if (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch workflows' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const zip = new JSZip();
    const errors: string[] = [];
    let successCount = 0;

    // Download and add each workflow to the zip
    for (const workflow of workflows || []) {
      try {
        console.log(`Downloading workflow: ${workflow.name} from ${workflow.raw_url}`);
        
        const response = await fetch(workflow.raw_url);
        if (!response.ok) {
          errors.push(`Failed to download ${workflow.name}: ${response.status}`);
          continue;
        }

        const content = await response.text();
        
        // Create safe filename and folder structure
        const safeFileName = `${workflow.slug}.json`;
        const folderName = workflow.category?.replace(/[^a-z0-9\-_\s]/gi, '').replace(/\s+/g, '-') || 'General';
        
        // Add to zip with folder structure
        zip.folder(folderName)?.file(safeFileName, content);
        successCount++;

      } catch (error) {
        console.error(`Error processing workflow ${workflow.name}:`, error);
        errors.push(`Failed to process ${workflow.name}`);
      }
    }

    // Add README file
    const readmeContent = `# n8n Workflows Collection

Downloaded on: ${new Date().toISOString()}
Total workflows: ${successCount}
${errors.length > 0 ? `\nErrors encountered:\n${errors.map(e => `- ${e}`).join('\n')}` : ''}

## How to Import

1. Open your n8n instance
2. Go to Workflows
3. Click "Import from file"
4. Select the .json files from this archive
5. Configure any required credentials

## Need Help?

Visit: https://ahmedwesam.com/contact
Repository: https://github.com/zie619/n8n-workflows
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

    console.log(`ZIP file generated. Size: ${zipBlob.size} bytes, Success: ${successCount}`);

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

export default async function handler(request: Request) {
  if (request.method === 'POST') {
    return POST(request);
  }
  
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}