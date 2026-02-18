
'use client';

import { useState, useEffect } from 'react';
import { useRole } from '@/presentation/hooks/useRole';
import { Hermano } from '@/core/domain/entities/Hermano';
import { Familiar } from '@/core/domain/entities/Familiar';
import { Merito } from '@/core/domain/entities/Merito';
import { InsForgeHermanoRepository } from '@/infrastructure/repositories/insforge/InsForgeHermanoRepository';
import { InsForgeFamiliarRepository } from '@/infrastructure/repositories/insforge/InsForgeFamiliarRepository';
import { InsForgeMeritoRepository } from '@/infrastructure/repositories/insforge/InsForgeMeritoRepository';
import { ObtenerMiPerfilUseCase, ObtenerMiPerfilOutput } from '@/core/use-cases/secretaria/ObtenerMiPerfilUseCase';

const hermanoRepo = new InsForgeHermanoRepository();
const familiarRepo = new InsForgeFamiliarRepository();
const meritoRepo = new InsForgeMeritoRepository();
const obtenerMiPerfilUseCase = new ObtenerMiPerfilUseCase(hermanoRepo, familiarRepo, meritoRepo);

export function useMiPerfil() {
    const { user, isLoaded } = useRole();
    const [perfilData, setPerfilData] = useState<ObtenerMiPerfilOutput | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadPerfil = async () => {
            if (!isLoaded || !user) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const result = await obtenerMiPerfilUseCase.execute(user.id);
                setPerfilData(result);
            } catch (err) {
                console.error('Error loading profile:', err);
                setError('No se pudo cargar tu perfil de hermano.');
            } finally {
                setLoading(false);
            }
        };

        loadPerfil();
    }, [user, isLoaded]);

    return {
        miPerfil: perfilData?.hermano || null,
        familiares: perfilData?.familiares || [],
        meritos: perfilData?.meritos || [],
        puntosTotales: perfilData?.puntosTotales || 0,
        loading,
        error
    };
}
