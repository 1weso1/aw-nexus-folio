import { supabase } from '@/integrations/supabase/client';

export interface SyncResponse {
  success: boolean;
  message: string;
  processed?: number;
  errors?: number;
  total?: number;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('Triggering workflow sync via edge function...');
    
    // Create Supabase client with service role for server-side operations
    const supabaseAdmin = supabase;
    
    // Call the sync-workflows edge function
    const { data, error } = await supabaseAdmin.functions.invoke('sync-workflows', {
      body: {} // Empty body - function doesn't need parameters
    });

    if (error) {
      console.error('Sync edge function error:', error);
      throw new Error(`Sync failed: ${error.message}`);
    }

    console.log('Sync completed:', data);

    // Return the response from the edge function
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Server sync error:', error);
    
    const errorResponse: SyncResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Sync failed',
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}