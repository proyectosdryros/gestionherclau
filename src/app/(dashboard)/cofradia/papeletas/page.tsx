
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/presentation/components/ui/Tabs';
import { Button } from '@/presentation/components/ui/Button';
import { ArrowLeft, Loader2, Tag, List, Ticket } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

// Importamos los componentes de las vistas anteriores (o su lógica)
import ListadoPapeletasContent from '../listado/page';
import VentaPapeletasContent from '../ventas/page';

// Nota: Como los archivos originales exportan componentes default que usan hooks de navegación,
// voy a crear una estructura de pestañas que envuelva a estos componentes o refactorizar su contenido.
// Sin embargo, para no romper nada, voy a copiar y adaptar la lógica aquí.

import ListadoComponent from './ListadoTab';
import VentaComponent from './VentaTab';
import CortejoComponent from './CortejoTab';

function GestionPapeletasContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'listado');

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/cofradia')} className="rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-slate-900 leading-none">Gestión de Papeletas</h1>
                    <p className="text-sm text-slate-500 font-medium tracking-tight mt-1">
                        Venta, emisión y control de las solicitudes del cortejo.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="listado" value={activeTab} onValueChange={setActiveTab} className="bg-white p-2 rounded-3xl border border-slate-100 shadow-sm">
                <TabsList className="grid grid-cols-3 bg-slate-50 p-1 rounded-2xl h-14">
                    <TabsTrigger value="listado" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold gap-2">
                        <List className="w-4 h-4" /> Listado General
                    </TabsTrigger>
                    <TabsTrigger value="ventas" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold gap-2">
                        <Tag className="w-4 h-4" /> Nueva Venta (TPV)
                    </TabsTrigger>
                    <TabsTrigger value="cortejo" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold gap-2">
                        <Ticket className="w-4 h-4" /> Configuración Cortejo
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="listado">
                        <Suspense fallback={<div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
                            <ListadoComponent />
                        </Suspense>
                    </TabsContent>
                    <TabsContent value="ventas">
                        <Suspense fallback={<div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
                            <VentaComponent />
                        </Suspense>
                    </TabsContent>
                    <TabsContent value="cortejo">
                        <Suspense fallback={<div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
                            <CortejoComponent />
                        </Suspense>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}

export default function GestionPapeletasPage() {
    return (
        <Suspense fallback={<div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
            <GestionPapeletasContent />
        </Suspense>
    );
}
