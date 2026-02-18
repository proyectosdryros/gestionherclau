
'use client';

import { useUser } from '@insforge/nextjs';


export type UserRole = 'SUPERADMIN' | 'JUNTA' | 'HERMANO' | 'anonimo';

export function useRole() {
    const { user, isLoaded } = useUser();

    // En un sistema real, el rol vendría en el perfil del usuario o metadata
    // Aquí mapeamos lo que esperamos del backend
    const rawRole = (user?.profile?.role as string) || 'anonimo';
    const role = rawRole.toUpperCase() as UserRole;

    return {
        role,
        isLoaded,
        isAdmin: role === 'SUPERADMIN' || role === 'JUNTA',
        isSuperadmin: role === 'SUPERADMIN',
        isJunta: role === 'JUNTA',
        isHermano: role === 'HERMANO',
        user
    };
}
