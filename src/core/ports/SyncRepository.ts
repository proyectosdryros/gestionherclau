/**
 * Repository Port for Synchronization
 * Defines methods needed to push/pull changes to/from the remote server
 */
export interface SyncRepository {
    /**
     * Pushes a batch of created/updated records to the remote server
     * @param table Name of the remote table
     * @param data Array of records to upsert
     */
    push(table: string, data: any[]): Promise<void>;

    /**
     * Deletes a batch of records from the remote server
     * @param table Name of the remote table
     * @param ids Array of IDs to delete
     */
    delete(table: string, ids: string[]): Promise<void>;

    /**
     * Pulls changes from the remote server since a specific timestamp
     * @param table Name of the remote table
     * @param lastSyncTimestamp ISO date string of the last successful sync
     */
    pull(table: string, lastSyncTimestamp: string | null): Promise<any[]>;
}
