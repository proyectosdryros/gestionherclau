
'use client';

import { useUser } from '@insforge/nextjs';


export type UserRole = 'SUPERADMIN' | 'JUNTA' | 'HERMANO' | 'anonimo';

export function useRole() {
    const { user, isLoaded } = useUser();

    // En un sistema real, el rol vendría en el perfil del usuario o metadata
    // Aquí mapeamos lo que esperamos del backend
    let rawRole = (user?.profile?.role as string) || 'anonimo';

    // Regla hardcoded para el administrador principal
    if (user?.email === 'alarmdryros@gmail.com') {
        rawRole = 'SUPERADMIN';
    }

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
