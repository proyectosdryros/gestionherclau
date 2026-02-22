/**
 * Hermanos List Page (Client Component)
 * Página principal de gestión de hermanos con modal de creación
 */

'use client';

import { Suspense, useState } from 'react';
import { HermanosList } from '@/presentation/components/hermanos/HermanosList';
import { Modal } from '@/presentation/components/ui/Modal';
import { HermanoForm } from '@/presentation/components/hermanos/HermanoForm';
import { ReorganizarHermanosUseCase } from '@/core/use-cases/secretaria/ReorganizarHermanosUseCase';
import { InsForgeHermanoRepository } from '@/infrastructure/repositories/insforge/InsForgeHermanoRepository';

const repo = new InsForgeHermanoRepository();
const reorganizarUseCase = new ReorganizarHermanosUseCase(repo);

export default function HermanosPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isReorganizing, setIsReorganizing] = useState(false);

    const handleSuccess = () => {
        setIsModalOpen(false);
        setRefreshKey((prev) => prev + 1); // Forzar re-render de la lista
    };

    const handleReorganizar = async () => {
        if (!confirm('¿Estás seguro de que deseas reorganizar TODOS los números de hermano desde el número 1? Esto afectará a todo el censo activo.')) return;

        try {
            setIsReorganizing(true);
            await reorganizarUseCase.execute();
            setRefreshKey(prev => prev + 1);
            alert('Censo reorganizado correctamente.');
        } catch (error: any) {
            console.error('Error reorganizando:', error);
            alert('Error al reorganizar el censo: ' + error.message);
        } finally {
            setIsReorganizing(false);
        }
    };

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Gestión de Hermanos</h1>
                    <p className="text-muted-foreground mt-1">
                        Listado completo de hermanos registrados
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleReorganizar}
                        disabled={isReorganizing}
                        className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50 text-xs font-bold"
                    >
                        {isReorganizing ? 'Renumerando...' : 'Reorganizar Números'}
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        + Nuevo Hermano
                    </button>
                </div>
            </div>

            <Suspense fallback={<div className="text-center py-12">Cargando hermanos...</div>}>
                <HermanosList key={refreshKey} />
            </Suspense>

            {/* Modal de creación */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Nuevo Hermano"
            >
                <HermanoForm onSuccess={handleSuccess} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
}
