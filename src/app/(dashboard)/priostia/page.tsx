
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Badge } from '@/presentation/components/ui/Badge';
import { Package, MapPin, AlertCircle, Plus, Search, Filter, Settings, ArrowRightLeft } from 'lucide-react';
import { Input } from '@/presentation/components/ui/Input';
import { useEnseres } from '@/presentation/hooks/useEnseres';

export default function PriostiaPage() {
    const { enseres, loading } = useEnseres();

    const stats = {
        total: enseres.length,
        bueno: enseres.filter(e => e.estado === 'BUENO').length,
        restauracion: enseres.filter(e => e.estado === 'RESTAURACION').length,
        otros: enseres.filter(e => !['BUENO', 'RESTAURACION'].includes(e.estado)).length,
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Priostía</h1>
                    <p className="text-muted-foreground">Gestión de inventario, enseres y patrimonio.</p>
                </div>
                <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4" /> Nuevo Enser
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-indigo-500/5 border-indigo-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Enseres</CardTitle>
                        <Package className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : stats.total}</div>
                        <p className="text-xs text-muted-foreground">Artículos en inventario</p>
                    </CardContent>
                </Card>
                <Card className="bg-green-500/5 border-green-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Estado Bueno</CardTitle>
                        <AlertCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : stats.bueno}</div>
                        <p className="text-xs text-muted-foreground">Listos para procesionar</p>
                    </CardContent>
                </Card>
                <Card className="bg-amber-500/5 border-amber-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">En Restauración</CardTitle>
                        <Settings className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : stats.restauracion}</div>
                        <p className="text-xs text-muted-foreground">En taller especializado</p>
                    </CardContent>
                </Card>
                <Card className="bg-blue-500/5 border-blue-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Otros Estados</CardTitle>
                        <ArrowRightLeft className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : stats.otros}</div>
                        <p className="text-xs text-muted-foreground">Bajas, perdidos o regular</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Inventario de Patrimonio</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Buscar enser..." className="pl-8 w-[250px]" />
                            </div>
                            <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b">
                                <tr className="text-left font-medium">
                                    <th className="p-4">Nombre</th>
                                    <th className="p-4">Categoría</th>
                                    <th className="p-4">Ubicación</th>
                                    <th className="p-4">Estado</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">Cargando inventario...</td>
                                    </tr>
                                ) : enseres.length > 0 ? (
                                    enseres.map((enser) => (
                                        <tr key={enser.id} className="hover:bg-muted/40 transition-colors">
                                            <td className="p-4 font-medium">{enser.nombre}</td>
                                            <td className="p-4"><Badge variant="outline">{enser.categoria}</Badge></td>
                                            <td className="p-4 flex items-center gap-1.5 text-muted-foreground">
                                                <MapPin className="w-3 h-3" /> {enser.ubicacion}
                                            </td>
                                            <td className="p-4">
                                                <Badge variant={enser.estado === 'BUENO' ? 'success' : 'warning'}>
                                                    {enser.estado}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-right">
                                                <Button variant="ghost" size="sm">Detalles</Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">No hay enseres registrados.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

