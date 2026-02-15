/**
 * Dexie Database Configuration
 * IndexedDB schema con Dexie.js
 */

import Dexie, { Table } from 'dexie';
import type { HermanoDTO, FamiliarDTO, MeritoDTO } from '@/lib/validations/hermano.schemas';
import type { ReciboDTO, PagoDTO } from '@/lib/validations/tesoreria.schemas';
import type { PuestoDTO, PapeletaDTO } from '@/lib/validations/cofradia.schemas';

/**
 * SyncQueue Item - para sincronización offline
 */
export interface SyncQueueItem {
    id: string; // UUIDv7
    entityType: 'hermano' | 'familiar' | 'merito' | 'recibo' | 'papeleta' | 'enser';
    entityId: string;
    operation: 'CREATE' | 'UPDATE' | 'DELETE';
    payload: string; // JSON stringified
    localTimestamp: number;
    serverTimestamp: number | null;
    attempts: number;
    priority: 'high' | 'normal' | 'low';
    status: 'pending' | 'syncing' | 'conflict' | 'synced' | 'failed';
    nextRetryAt: number | null;
}

/**
 * Hermandades Database
 */
export class HermandadesDB extends Dexie {
    // Tablas tipadas
    hermanos!: Table<HermanoDTO>;
    familiares!: Table<FamiliarDTO>;
    meritos!: Table<MeritoDTO>;
    recibos!: Table<ReciboDTO>;
    pagos!: Table<PagoDTO>;
    papeletas!: Table<PapeletaDTO>;
    puestos!: Table<PuestoDTO>;
    syncQueue!: Table<SyncQueueItem>;

    constructor() {
        super('hermandades_db');

        this.version(1).stores({
            hermanos: 'id, numeroHermano, dni, email, estado, [estado+cuotasAlDia], fechaAlta',
            familiares: 'id, hermanoId, tipo',
            meritos: 'id, hermanoId, fecha, tipo',
            syncQueue: 'id, [status+priority], [status+nextRetryAt], localTimestamp, entityType',
        });

        this.version(2).stores({
            // Mantenemos lo anterior
            hermanos: 'id, numeroHermano, dni, email, estado, [estado+cuotasAlDia], fechaAlta',
            familiares: 'id, hermanoId, tipo',
            meritos: 'id, hermanoId, fecha, tipo',
            syncQueue: 'id, [status+priority], [status+nextRetryAt], localTimestamp, entityType',

            // Nuevas tablas de Tesorería
            recibos: 'id, hermanoId, estado, tipo, fechaEmision',
            pagos: 'id, reciboId, fechaPago, metodoPago',
        });

        // Hooks para encriptación/desencriptación
        this.hermanos.hook('creating', this.encryptSensitiveFields);
        this.hermanos.hook('reading', this.decryptSensitiveFields);
        this.hermanos.hook('updating', this.encryptSensitiveFields);
    }

    /**
     * Encripta campos sensibles antes de guardar
     * TODO: Implementar encriptación AES-256 real con crypto-js
     */
    private encryptSensitiveFields(primKey: any, obj: any) {
        // Placeholder - implementar en Sprint 3-4
        return obj;
    }

    /**
     * Desencripta campos sensibles al leer
     */
    private decryptSensitiveFields(obj: any) {
        // Placeholder - implementar en Sprint 3-4
        return obj;
    }
}

// Instancia singleton
export const db = new HermandadesDB();
