/**
 * Hermanos List Page (Client Component)
 * Página principal de gestión de hermanos con modal de creación
 */

'use client';

import { Suspense, useState } from 'react';
import { HermanosList } from '@/presentation/components/hermanos/HermanosList';
import { Modal } from '@/presentation/components/ui/Modal';
import { HermanoForm } from '@/presentation/components/hermanos/HermanoForm';

export default function HermanosPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleSuccess = () => {
        setIsModalOpen(false);
        setRefreshKey((prev) => prev + 1); // Forzar re-render de la lista
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
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                    + Nuevo Hermano
                </button>
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
