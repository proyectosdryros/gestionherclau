
import { SyncRepository } from '@/core/ports/SyncRepository';
import { insforge } from '@/lib/insforge';

export class InsForgeSyncRepository implements SyncRepository {
    async push(table: string, data: any[]): Promise<void> {
        if (data.length === 0) return;

        const { error } = await insforge.database
            .from(table)
            .upsert(data, {
                onConflict: 'id',
            });

        if (error) {
            console.error(`Error pushing to ${table}:`, error);
            throw new Error(`Sync Push Error (${table}): ${error.message}`);
        }
    }

    async delete(table: string, ids: string[]): Promise<void> {
        if (ids.length === 0) return;

        const { error } = await insforge.database
            .from(table)
            .delete()
            .in('id', ids);

        if (error) {
            console.error(`Error deleting from ${table}:`, error);
            throw new Error(`Sync Delete Error (${table}): ${error.message}`);
        }
    }

    async pull(table: string, lastSyncTimestamp: string | null): Promise<any[]> {
        let query = insforge.database.from(table).select('*');

        if (lastSyncTimestamp) {
            query = query.gt('updated_at', lastSyncTimestamp);
        }

        const { data, error } = await query.order('updated_at', { ascending: true });

        if (error) {
            console.error(`Error pulling from ${table}:`, error);
            throw new Error(`Sync Pull Error (${table}): ${error.message}`);
        }

        return data || [];
    }
}
