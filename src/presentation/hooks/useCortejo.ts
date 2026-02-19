
'use client';

import { useState, useCallback, useEffect } from 'react';
import { CortejoStructure, TramoCortejo, SubtramoCortejo, ElementoCortejo, PosicionCortejo } from '@/core/domain/entities/Cortejo';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'cortejo_v1_structure';

export function useCortejo(temporada: number = 2025) {
    const [structure, setStructure] = useState<CortejoStructure | null>(null);
    const [loading, setLoading] = useState(true);

    // Inicializar Cortejo Base
    const initBaseCortejo = useCallback(() => {
        const nombresTramos = [
            'Cruz de Guía',
            'Cristo de la Vera Cruz',
            'Santo Entierro',
            'S.S. en su Soledad'
        ];

        const tramos: TramoCortejo[] = nombresTramos.map((nombre, index) => {
            const tramoId = uuidv4();

            // Subtramo inicial (X.1)
            const subtramo: SubtramoCortejo = {
                id: uuidv4(),
                numero: `${index}.1`,
                elementos: []
            };

            // Añadir Insignia inicial del tramo
            subtramo.elementos.push({
                id: uuidv4(),
                tipo: 'INSIGNIA',
                nombre: index === 0 ? 'Cruz de Guía' : `Insignia de Tramo ${index}`,
                posiciones: [{ id: uuidv4(), hermanoId: null, papeletaId: null, nombrePuesto: 'Portador' }]
            });

            // Añadir 10 filas de nazarenos
            for (let i = 1; i <= 10; i++) {
                subtramo.elementos.push({
                    id: uuidv4(),
                    tipo: 'FILA_NAZARENOS',
                    nombre: `Fila ${i}`,
                    posiciones: [
                        { id: uuidv4(), hermanoId: null, papeletaId: null, nombrePuesto: 'Izquierda' },
                        { id: uuidv4(), hermanoId: null, papeletaId: null, nombrePuesto: 'Derecha' }
                    ]
                });
            }

            return {
                id: tramoId,
                numero: index,
                nombre,
                subtramos: [subtramo]
            };
        });

        const newStructure: CortejoStructure = {
            id: uuidv4(),
            temporada,
            tramos
        };

        setStructure(newStructure);
        saveStructure(newStructure);
    }, [temporada]);

    // Cargar desde Storage (para demo actual, luego Supabase)
    useEffect(() => {
        const saved = localStorage.getItem(`${STORAGE_KEY}_${temporada}`);
        if (saved) {
            setStructure(JSON.parse(saved));
        } else {
            initBaseCortejo();
        }
        setLoading(false);
    }, [temporada, initBaseCortejo]);

    const saveStructure = (newStructure: CortejoStructure) => {
        localStorage.setItem(`${STORAGE_KEY}_${temporada}`, JSON.stringify(newStructure));
        setStructure(newStructure);
    };

    const addFila = (tramoIndex: number, subtramoIndex: number) => {
        if (!structure) return;
        const newStructure = { ...structure };
        const elementos = newStructure.tramos[tramoIndex].subtramos[subtramoIndex].elementos;

        elementos.push({
            id: uuidv4(),
            tipo: 'FILA_NAZARENOS',
            nombre: `Fila ${elementos.filter(e => e.tipo === 'FILA_NAZARENOS').length + 1}`,
            posiciones: [
                { id: uuidv4(), hermanoId: null, papeletaId: null, nombrePuesto: 'Izquierda' },
                { id: uuidv4(), hermanoId: null, papeletaId: null, nombrePuesto: 'Derecha' }
            ]
        });

        saveStructure(newStructure);
    };

    const removeElemento = (tramoIndex: number, subtramoIndex: number, elementoId: string) => {
        if (!structure) return;
        const newStructure = { ...structure };
        const subtramo = newStructure.tramos[tramoIndex].subtramos[subtramoIndex];

        subtramo.elementos = subtramo.elementos.filter(e => e.id !== elementoId);

        saveStructure(newStructure);
    };

    const addInsignia = (tramoIndex: number) => {
        if (!structure) return;
        const newStructure = { ...structure };
        const tramo = newStructure.tramos[tramoIndex];

        // Crear nuevo subtramo
        const nuevoNumero = `${tramo.numero}.${tramo.subtramos.length + 1}`;
        const nuevoSubtramo: SubtramoCortejo = {
            id: uuidv4(),
            numero: nuevoNumero,
            elementos: [
                {
                    id: uuidv4(),
                    tipo: 'INSIGNIA',
                    nombre: 'Nueva Insignia',
                    posiciones: [{ id: uuidv4(), hermanoId: null, papeletaId: null, nombrePuesto: 'Portador' }]
                }
            ]
        };

        tramo.subtramos.push(nuevoSubtramo);
        saveStructure(newStructure);
    };

    const asignarHermano = (tramoIndex: number, subtramoIndex: number, elementoId: string, posicionId: string, hermanoId: string, papeletaId: string) => {
        if (!structure) return;
        const newStructure = { ...structure };
        const elemento = newStructure.tramos[tramoIndex].subtramos[subtramoIndex].elementos.find(e => e.id === elementoId);

        if (elemento) {
            const posicion = elemento.posiciones.find(p => p.id === posicionId);
            if (posicion) {
                posicion.hermanoId = hermanoId;
                posicion.papeletaId = papeletaId;
            }
        }

        saveStructure(newStructure);
    };

    return {
        structure,
        loading,
        addFila,
        removeElemento,
        addInsignia,
        asignarHermano,
        resetCortejo: initBaseCortejo
    };
}
