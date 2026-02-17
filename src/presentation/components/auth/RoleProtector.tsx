
'use client';

import { useRole, UserRole } from '../../hooks/useRole';
import React from 'react';

interface RoleProtectorProps {
    children: React.ReactNode;
    allowedRoles: UserRole[];
    fallback?: React.ReactNode;
}

export function RoleProtector({
    children,
    allowedRoles,
    fallback = null
}: RoleProtectorProps) {
    const { role, isLoaded } = useRole();

    if (!isLoaded) return null;

    if (allowedRoles.includes(role)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
}
