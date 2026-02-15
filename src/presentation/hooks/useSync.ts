
import { useState, useCallback } from 'react';
import { SyncEngine } from '@/core/sync/SyncEngine';
import { InsForgeSyncRepository } from '@/infrastructure/repositories/insforge/InsForgeSyncRepository';

const syncRepo = new InsForgeSyncRepository();
const syncEngine = new SyncEngine(syncRepo);

export function useSync() {
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const performSync = useCallback(async () => {
        setIsSyncing(true);
        setError(null);
        try {
            await syncEngine.sync();
        } catch (e) {
            setError(e instanceof Error ? e : new Error('Unknown sync error'));
        } finally {
            setIsSyncing(false);
        }
    }, []);

    return {
        isSyncing,
        error,
        performSync
    };
}
