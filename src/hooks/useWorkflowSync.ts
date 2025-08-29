import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SyncResult {
  success: boolean;
  message: string;
  processed?: number;
  errors?: number;
  total?: number;
}

export const useWorkflowSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  const triggerSync = useCallback(async (): Promise<SyncResult> => {
    setIsSyncing(true);
    setSyncResult(null);
    
    try {
      console.log('Calling server-side sync API...');
      
      const response = await fetch('/api/workflows/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Sync failed: ${response.status}`);
      }

      const result = await response.json() as SyncResult;
      setSyncResult(result);
      console.log('Sync completed:', result);
      return result;
    } catch (error) {
      console.error('Sync failed:', error);
      const result: SyncResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Sync failed'
      };
      setSyncResult(result);
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Auto-sync on first load if database is empty
  const checkAndAutoSync = useCallback(async () => {
    try {
      const { count } = await supabase
        .from('workflows')
        .select('*', { count: 'exact', head: true });
      
      if (count === 0) {
        console.log('Database is empty, triggering auto-sync...');
        return await triggerSync();
      }
      
      return { success: true, message: 'Database already populated' };
    } catch (error) {
      console.error('Auto-sync check failed:', error);
      return { success: false, message: 'Failed to check database state' };
    }
  }, [triggerSync]);

  return {
    isSyncing,
    syncResult,
    triggerSync,
    checkAndAutoSync
  };
};