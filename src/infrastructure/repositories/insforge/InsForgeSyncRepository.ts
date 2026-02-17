
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
        console.log(`[SyncRepository] Pulling from ${table} with lastSync:`, lastSyncTimestamp);
        let query = insforge.database.from(table).select('*');

        // Ensure we only filter if we have a valid-looking timestamp string
        if (lastSyncTimestamp && lastSyncTimestamp.trim() !== '' && lastSyncTimestamp !== 'null') {
            query = query.gt('updated_at', lastSyncTimestamp);
        }

        try {
            const { data, error } = await query.order('updated_at', { ascending: true });

            if (error) {
                // Log with more detail in case it's a PostgrestError or similar
                const errorInfo = {
                    message: error.message || (typeof error === 'string' ? error : 'No message'),
                    details: error.details,
                    code: error.code,
                    hint: error.hint,
                    stack: (error as any).stack
                };
                console.error(`[SyncRepository] Error pulling from ${table}:`, errorInfo);
                throw new Error(`Sync Pull Error (${table}): ${errorInfo.message}`);
            }

            return data || [];
        } catch (err: any) {
            console.error(`[SyncRepository] CRASH pulling from ${table}:`, err);
            throw new Error(`Sync Pull Crash (${table}): ${err.message || 'Unknown crash'}`);
        }
    }
}
