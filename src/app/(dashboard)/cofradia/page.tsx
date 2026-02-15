
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Badge } from '@/presentation/components/ui/Badge';
import { Users, UserCheck, Settings, Wand2, ArrowRightLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function CofradiaPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cofradía</h1>
                    <p className="text-muted-foreground">Planificación del cortejo y asignación de puestos.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Settings className="w-4 h-4" /> Configurar Puestos
                    </Button>
                    <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-none">
                        <Wand2 className="w-4 h-4" /> Asignación Automática
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Solicitudes Totales</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">124</div>
                        <p className="text-xs text-muted-foreground">Papeletas pedidas para este año</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Puestos Asignados</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">86</div>
                        <p className="text-xs text-muted-foreground">69% del cortejo completado</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Asignaciones Manuales</CardTitle>
                        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-500">12</div>
                        <p className="text-xs text-muted-foreground">Ajustes manuales realizados</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-slate-800">
                <CardHeader>
                    <CardTitle>Cortejo Procesional</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        {['Tramo de Cristo', 'Tramo de Virgen'].map((seccion) => (
                            <div key={seccion} className="space-y-4">
                                <h3 className="text-lg font-semibold border-l-4 border-primary pl-3">{seccion}</h3>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/30 transition-shadow cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold">
                                                    {i}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Puesto {i}</p>
                                                    <p className="text-xs text-muted-foreground">Sin asignar</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-xs">Asignar</Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
