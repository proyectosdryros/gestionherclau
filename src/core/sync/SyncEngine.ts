
import { SyncRepository } from '../ports/SyncRepository';
import { db } from '@/infrastructure/repositories/indexeddb/db';

export class SyncEngine {
    private syncRepo: SyncRepository;
    private isSyncing: boolean = false;

    constructor(syncRepo: SyncRepository) {
        this.syncRepo = syncRepo;
    }

    /**
     * Initiates the synchronization process.
     */
    async sync() {
        if (this.isSyncing) return;

        this.isSyncing = true;
        console.log('[SyncEngine] Starting sync...');

        try {
            await this.push();
            await this.pull();
            console.log('[SyncEngine] Sync completed successfully.');
        } catch (error) {
            console.error('[SyncEngine] Sync failed:', error);
            throw error; // Rethrow for UI to handle if needed
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Pushes pending local changes to the remote server.
     * Processes changes in groups by entity type to respect database constraints (e.g., Hermano before Familiar).
     */
    private async push() {
        const pendingItems = await db.syncQueue
            .where('status')
            .anyOf('pending', 'failed')
            .toArray();

        if (pendingItems.length === 0) {
            console.log('[SyncEngine] No pending changes to push.');
            return;
        }

        console.log(`[SyncEngine] Pushing ${pendingItems.length} changes...`);

        // Group items by entityType and operation to optimize batches
        // Order matters: CREATE/UPDATE Hermano -> CREATE/UPDATE Familiar/Merito -> DELETEs
        const order = ['hermano', 'familiar', 'merito'];

        for (const type of order) {
            const itemsOfType = pendingItems.filter(i => i.entityType === type && i.operation !== 'DELETE');
            if (itemsOfType.length > 0) {
                const data = itemsOfType.map(i => JSON.parse(i.payload));
                const table = this.getTableName(type);
                await this.syncRepo.push(table, data);
            }
        }

        // Process Deletes last (usually safer)
        for (const type of order) {
            const deletesOfType = pendingItems.filter(i => i.entityType === type && i.operation === 'DELETE');
            if (deletesOfType.length > 0) {
                const ids = deletesOfType.map(i => i.entityId);
                const table = this.getTableName(type);
                await this.syncRepo.delete(table, ids);
            }
        }

        // Mark as synced and clear queue (or move to history)
        const ids = pendingItems.map(i => i.id);
        await db.syncQueue.bulkDelete(ids);
    }

    /**
     * Pulls remote changes from the server and updates the local database.
     */
    private async pull() {
        const lastSync = localStorage.getItem('last_sync_timestamp');
        const entityTypes: Array<'hermano' | 'familiar' | 'merito'> = ['hermano', 'familiar', 'merito'];

        let latestTimestamp: string | null = lastSync;

        for (const type of entityTypes) {
            const table = this.getTableName(type);
            const remoteChanges = await this.syncRepo.pull(table, lastSync);

            if (remoteChanges.length > 0) {
                console.log(`[SyncEngine] Applying ${remoteChanges.length} remote changes for ${table}...`);

                // Update local DB
                const dexieTable = this.getDexieTable(type);
                await dexieTable.bulkPut(remoteChanges);

                // Track the most recent updated_at
                const lastItem = remoteChanges[remoteChanges.length - 1];
                if (!latestTimestamp || lastItem.updated_at > latestTimestamp) {
                    latestTimestamp = lastItem.updated_at;
                }
            }
        }

        if (latestTimestamp) {
            localStorage.setItem('last_sync_timestamp', latestTimestamp);
        }
    }

    private getTableName(entityType: string): string {
        switch (entityType) {
            case 'hermano': return 'hermanos';
            case 'familiar': return 'familiares';
            case 'merito': return 'meritos';
            default: throw new Error(`Unknown entity type: ${entityType}`);
        }
    }

    private getDexieTable(entityType: string) {
        switch (entityType) {
            case 'hermano': return db.hermanos;
            case 'familiar': return db.familiares;
            case 'merito': return db.meritos;
            default: throw new Error(`Unknown entity type: ${entityType}`);
        }
    }
}
