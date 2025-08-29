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
      const { data, error } = await supabase.functions.invoke('sync-workflows');
      
      if (error) throw error;
      
      const result = data as SyncResult;
      setSyncResult(result);
      return result;
    } catch (error) {
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