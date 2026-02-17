'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Hermano } from '@/core/domain/entities/Hermano';

import { ObtenerHermanoUseCase } from '@/core/use-cases/secretaria/ObtenerHermanoUseCase';
import { Button } from '@/presentation/components/ui/Button'; // Assuming we have Button, or I'll use standard button
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/Tabs';
import { Modal } from '@/presentation/components/ui/Modal';
import { HermanoForm } from '@/presentation/components/hermanos/HermanoForm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PencilIcon, ArrowLeftIcon } from 'lucide-react'; // I need to check if lucide-react is installed, usually is in shadcn

// Instanciar dependencias
import { InsForgeHermanoRepository } from '@/infrastructure/repositories/insforge/InsForgeHermanoRepository';
import { InsForgeFamiliarRepository } from '@/infrastructure/repositories/insforge/InsForgeFamiliarRepository';
import { InsForgeMeritoRepository } from '@/infrastructure/repositories/insforge/InsForgeMeritoRepository';
import { RegistrarFamiliarUseCase } from '@/core/use-cases/secretaria/RegistrarFamiliarUseCase';
import { EliminarFamiliarUseCase } from '@/core/use-cases/secretaria/EliminarFamiliarUseCase';
import { RegistrarMeritoUseCase } from '@/core/use-cases/secretaria/RegistrarMeritoUseCase';
import { EliminarMeritoUseCase } from '@/core/use-cases/secretaria/EliminarMeritoUseCase';
import { FamiliaresList } from '@/presentation/components/familiares/FamiliaresList';
import { MeritosList } from '@/presentation/components/meritos/MeritosList';
import { FamiliarCreateDTO, MeritoCreateDTO } from '@/lib/validations/hermano.schemas';

// Instanciar dependencias
// NOTE: In a real app, use dependency injection container or React Context
const hermanoRepository = new InsForgeHermanoRepository();
const familiarRepository = new InsForgeFamiliarRepository();
const meritoRepository = new InsForgeMeritoRepository();

const obtenerUseCase = new ObtenerHermanoUseCase(
    hermanoRepository,
    familiarRepository,
    meritoRepository
);
const registrarFamiliarUseCase = new RegistrarFamiliarUseCase(familiarRepository);
const eliminarFamiliarUseCase = new EliminarFamiliarUseCase(familiarRepository);
const registrarMeritoUseCase = new RegistrarMeritoUseCase(meritoRepository);
const eliminarMeritoUseCase = new EliminarMeritoUseCase(meritoRepository);

interface HermanoDetailClientProps {
    id: string;
}

export function HermanoDetailClient({ id }: HermanoDetailClientProps) {
    const router = useRouter();
    const [hermano, setHermano] = useState<Hermano | null>(null);
    const [familiares, setFamiliares] = useState<any[]>([]); // Use appropriate type if available, e.g. Familiar[]
    const [meritos, setMeritos] = useState<any[]>([]); // Use appropriate type
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const loadHermano = useCallback(async () => {
        try {
            setLoading(true);
            const data = await obtenerUseCase.execute(id);
            if (!data) {
                setError('Hermano no encontrado');
            } else {
                setHermano(data.hermano);
                setFamiliares(data.familiares);
                setMeritos(data.meritos);
                setError(null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar hermano');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadHermano();
    }, [loadHermano]);

    const handleCreateFamiliar = async (data: FamiliarCreateDTO & { hermanoId: string }) => {
        try {
            await registrarFamiliarUseCase.execute(data);
            await loadHermano();
        } catch (error) {
            console.error('Error creating familiar:', error);
            // Optionally set error state or show toast
        }
    };

    const handleDeleteFamiliar = async (id: string) => {
        try {
            await eliminarFamiliarUseCase.execute(id);
            await loadHermano();
        } catch (error) {
            console.error('Error deleting familiar:', error);
        }
    };

    const handleCreateMerito = async (data: MeritoCreateDTO & { hermanoId: string }) => {
        try {
            await registrarMeritoUseCase.execute(data);
            await loadHermano();
        } catch (error) {
            console.error('Error creating merito:', error);
        }
    };

    const handleDeleteMerito = async (id: string) => {
        try {
            await eliminarMeritoUseCase.execute(id);
            await loadHermano();
        } catch (error) {
            console.error('Error deleting merito:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !hermano) {
        return (
            <div className="p-8 text-center text-red-500">
                <p>Error: {error || 'No encontrado'}</p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 text-blue-500 hover:underline"
                >
                    Volver
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {hermano.getNombreCompleto()}
                        </h1>
                        <p className="text-sm text-gray-500">
                            Nº Hermano: <span className="font-mono font-medium">{hermano.numeroHermano}</span>
                            {hermano.apodo && (
                                <span className="ml-2 text-primary font-medium">({hermano.apodo})</span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${hermano.isActivo()
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                        }`}>
                        {hermano.estado}
                    </span>
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                        <PencilIcon className="w-4 h-4" />
                        Editar
                    </button>
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="datos" className="w-full">
                <TabsList>
                    <TabsTrigger value="datos">Datos Personales</TabsTrigger>
                    <TabsTrigger value="familiares">Familiares</TabsTrigger>
                    <TabsTrigger value="meritos">Méritos</TabsTrigger>
                    <TabsTrigger value="historial">Historial</TabsTrigger>
                </TabsList>

                {/* Datos Tab */}
                <TabsContent value="datos" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Personal</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">DNI</h4>
                                <p className="mt-1">{hermano.dni?.toString() || 'Sin DNI'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Email</h4>
                                <p className="mt-1">{hermano.email?.toString() || '-'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Teléfono</h4>
                                <p className="mt-1">{hermano.telefono || '-'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Fecha Nacimiento</h4>
                                <p className="mt-1">
                                    {hermano.fechaNacimiento
                                        ? format(hermano.fechaNacimiento, 'dd/MM/yyyy')
                                        : '-'}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Fecha Alta</h4>
                                <p className="mt-1">
                                    {format(hermano.fechaAlta, 'dd/MM/yyyy')}
                                    <span className="text-xs text-gray-400 ml-2">
                                        ({hermano.getAntiguedad().getAños()} años)
                                    </span>
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Cuotas</h4>
                                <p className={`mt-1 font-medium ${hermano.cuotasAlDia ? 'text-green-600' : 'text-red-600'}`}>
                                    {hermano.cuotasAlDia ? 'Al día' : 'Pendientes'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Consentimientos RGPD</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between py-2 border-b">
                                <span>Tratamiento de Datos</span>
                                <span className={hermano.consentimientos.datos ? 'text-green-600' : 'text-red-600'}>
                                    {hermano.consentimientos.datos ? 'Aceptado' : 'Rechazado'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b">
                                <span>Uso de Imágenes</span>
                                <span className={hermano.consentimientos.imagenes ? 'text-green-600' : 'text-red-600'}>
                                    {hermano.consentimientos.imagenes ? 'Aceptado' : 'Rechazado'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span>Comunicaciones</span>
                                <span className={hermano.consentimientos.comunicaciones ? 'text-green-600' : 'text-red-600'}>
                                    {hermano.consentimientos.comunicaciones ? 'Aceptado' : 'Rechazado'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Familiares Tab */}
                <TabsContent value="familiares">
                    <Card>
                        <CardHeader>
                            <CardTitle>Familiares</CardTitle>
                            <CardDescription>Gestión de familiares vinculados</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FamiliaresList
                                hermanoId={hermano.id}
                                familiares={familiares}
                                onCreate={handleCreateFamiliar}
                                onDelete={handleDeleteFamiliar}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Méritos Tab */}
                <TabsContent value="meritos">
                    <Card>
                        <CardHeader>
                            <CardTitle>Méritos y Distinciones</CardTitle>
                            <CardDescription>Historial de méritos del hermano</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MeritosList
                                hermanoId={hermano.id}
                                meritos={meritos}
                                onCreate={handleCreateMerito}
                                onDelete={handleDeleteMerito}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Historial Tab */}
                <TabsContent value="historial">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Cambios</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-gray-500">
                                <p>Creado: {format(hermano.auditoria.created_at, 'dd/MM/yyyy HH:mm')}</p>
                                <p>Última actualización: {format(hermano.auditoria.updated_at, 'dd/MM/yyyy HH:mm')}</p>
                                <p>Versión: {hermano.auditoria.version}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Editar Hermano"
            >
                <HermanoForm
                    hermano={hermano}
                    onSuccess={() => {
                        setIsEditModalOpen(false);
                        loadHermano();
                    }}
                    onCancel={() => setIsEditModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
