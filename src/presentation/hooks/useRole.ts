
'use client';

import { useUser } from '@insforge/nextjs';

export type UserRole = 'superadmin' | 'junta_gobierno' | 'hermano' | 'anonimo';

export function useRole() {
    const { user, isLoaded } = useUser();

    // En un sistema real, el rol vendría en el perfil del usuario o metadata
    // Aquí mapeamos lo que esperamos del backend
    const role = (user?.profile?.role as UserRole) || 'anonimo';

    return {
        role,
        isLoaded,
        isAdmin: role === 'superadmin' || role === 'junta_gobierno',
        isSuperadmin: role === 'superadmin',
        isJunta: role === 'junta_gobierno',
        isHermano: role === 'hermano',
        user
    };
}
