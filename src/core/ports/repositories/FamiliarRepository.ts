/**
 * Repository Port (Interface) - Familiar
 */

import { Familiar } from '@/core/domain/entities/Familiar';

export interface FamiliarRepository {
    findById(id: string): Promise<Familiar | null>;

    findByHermanoId(hermanoId: string): Promise<Familiar[]>;

    create(familiar: Familiar): Promise<Familiar>;

    update(familiar: Familiar): Promise<Familiar>;

    delete(id: string): Promise<void>;
}
