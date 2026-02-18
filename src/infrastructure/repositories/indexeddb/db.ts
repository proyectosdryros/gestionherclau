/**
 * Dexie Database Configuration
 * IndexedDB schema con Dexie.js
 */

import Dexie, { Table } from 'dexie';
import type { HermanoDTO, FamiliarDTO, MeritoDTO } from '@/lib/validations/hermano.schemas';
import type { ReciboDTO, PagoDTO } from '@/lib/validations/tesoreria.schemas';
import type { PuestoDTO, PapeletaDTO } from '@/lib/validations/cofradia.schemas';
import type { EnserDTO, MovimientoEnserDTO } from '@/lib/validations/priostia.schemas';

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
    enseres!: Table<EnserDTO>;
    movimientos_enseres!: Table<MovimientoEnserDTO>;
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
            hermanos: 'id, numeroHermano, dni, email, estado, [estado+cuotasAlDia], fechaAlta',
            familiares: 'id, hermanoId, tipo',
            meritos: 'id, hermanoId, fecha, tipo',
            syncQueue: 'id, [status+priority], [status+nextRetryAt], localTimestamp, entityType',
            recibos: 'id, hermanoId, estado, tipo, fechaEmision',
            pagos: 'id, reciboId, fechaPago, metodoPago',
        });

        this.version(3).stores({
            hermanos: 'id, numeroHermano, dni, email, estado, [estado+cuotasAlDia], fechaAlta',
            familiares: 'id, hermanoId, tipo',
            meritos: 'id, hermanoId, fecha, tipo',
            syncQueue: 'id, [status+priority], [status+nextRetryAt], localTimestamp, entityType',
            recibos: 'id, hermanoId, estado, tipo, fechaEmision',
            pagos: 'id, reciboId, fechaPago, metodoPago',
            papeletas: 'id, [hermanoId+anio], hermanoId, anio, estado, puestoAsignadoId',
            puestos: 'id, nombre, categoria, seccion',
        });

        this.version(4).stores({
            hermanos: 'id, numeroHermano, dni, email, estado, [estado+cuotasAlDia], fechaAlta',
            familiares: 'id, hermanoId, tipo',
            meritos: 'id, hermanoId, fecha, tipo',
            syncQueue: 'id, [status+priority], [status+nextRetryAt], localTimestamp, entityType',
            recibos: 'id, hermanoId, estado, tipo, fechaEmision',
            pagos: 'id, reciboId, fechaPago, metodoPago',
            papeletas: 'id, [hermanoId+anio], hermanoId, anio, estado, puestoAsignadoId',
            puestos: 'id, nombre, categoria, seccion',
            enseres: 'id, nombre, categoria, estado, ubicacion',
            movimientos_enseres: 'id, enserId, tipo, fecha, responsable',
        });

        this.version(5).stores({
            hermanos: 'id, numeroHermano, dni, email, estado, [estado+cuotasAlDia], fechaAlta, userId',
            familiares: 'id, hermanoId, tipo',
            meritos: 'id, hermanoId, fecha, tipo',
            syncQueue: 'id, [status+priority], [status+nextRetryAt], localTimestamp, entityType',
            recibos: 'id, hermanoId, estado, tipo, fechaEmision',
            pagos: 'id, reciboId, fechaPago, metodoPago',
            papeletas: 'id, [hermanoId+anio], hermanoId, anio, estado, puestoAsignadoId',
            puestos: 'id, nombre, categoria, seccion',
            enseres: 'id, nombre, categoria, estado, ubicacion',
            movimientos_enseres: 'id, enserId, tipo, fecha, responsable',
        });

        // Hooks para encriptación/desencriptación
        this.hermanos.hook('creating', this.encryptSensitiveFields);
        this.hermanos.hook('reading', this.decryptSensitiveFields);
        this.hermanos.hook('updating', this.encryptSensitiveFields);
    }

    private encryptSensitiveFields(primKey: any, obj: any) {
        return obj;
    }

    private decryptSensitiveFields(obj: any) {
        return obj;
    }
}

// Instancia singleton
export const db = new HermandadesDB();
