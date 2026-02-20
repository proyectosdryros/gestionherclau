
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
            const subtramos: SubtramoCortejo[] = [];

            // Tramo 0: Cruz de Guía + Faroles solamente
            if (index === 0) {
                const sub0: SubtramoCortejo = {
                    id: uuidv4(),
                    numero: '0.1',
                    elementos: [
                        {
                            id: uuidv4(),
                            tipo: 'INSIGNIA',
                            nombre: 'Cruz de Guía',
                            posiciones: [{ id: uuidv4(), hermanoId: null, papeletaId: null, nombrePuesto: 'Portador' }]
                        },
                        {
                            id: uuidv4(),
                            tipo: 'INSIGNIA',
                            nombre: 'Farol Izquierdo',
                            posiciones: [{ id: uuidv4(), hermanoId: null, papeletaId: null, nombrePuesto: 'Portador' }]
                        },
                        {
                            id: uuidv4(),
                            tipo: 'INSIGNIA',
                            nombre: 'Farol Derecho',
                            posiciones: [{ id: uuidv4(), hermanoId: null, papeletaId: null, nombrePuesto: 'Portador' }]
                        }
                    ]
                };
                subtramos.push(sub0);
            } else {
                // Tramos 1-3: Insignia tramo -> 10 filas -> Paso final
                const sub1: SubtramoCortejo = {
                    id: uuidv4(),
                    numero: `${index}.1`,
                    elementos: []
                };

                // Insignia inicial
                sub1.elementos.push({
                    id: uuidv4(),
                    tipo: 'INSIGNIA',
                    nombre: `Insignia de Tramo ${index}`,
                    posiciones: [{ id: uuidv4(), hermanoId: null, papeletaId: null, nombrePuesto: 'Portador' }]
                });

                // 10 filas de nazarenos
                for (let i = 1; i <= 10; i++) {
                    sub1.elementos.push({
                        id: uuidv4(),
                        tipo: 'FILA_NAZARENOS',
                        nombre: `Fila ${i}`,
                        posiciones: [
                            { id: uuidv4(), hermanoId: null, papeletaId: null, nombrePuesto: 'Izquierda' },
                            { id: uuidv4(), hermanoId: null, papeletaId: null, nombrePuesto: 'Derecha' }
                        ]
                    });
                }

                // Paso Final (Siempre al final para que los nazarenos vayan delante)
                sub1.elementos.push({
                    id: uuidv4(),
                    tipo: 'PASO',
                    nombre: nombre,
                    posiciones: [{ id: uuidv4(), hermanoId: null, papeletaId: null, nombrePuesto: 'Paso' }]
                });

                subtramos.push(sub1);
            }

            return {
                id: tramoId,
                numero: index,
                nombre,
                subtramos
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

        // Insertar filas antes del paso si existe
        const pasoIndex = elementos.findIndex(e => e.tipo === 'PASO');
        const insertPosition = pasoIndex !== -1 ? pasoIndex : elementos.length;

        elementos.splice(insertPosition, 0, {
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
        const elementoIndex = subtramo.elementos.findIndex(e => e.id === elementoId);

        if (elementoIndex === -1) return;
        const elemento = subtramo.elementos[elementoIndex];

        // Si es una insignia y no es la primera, debemos gestionar la unión del subtramo 
        // o si es un subtramo dedicado, borrarlo (esto se refinará al implementar los subtramos reales)
        subtramo.elementos.splice(elementoIndex, 1);

        saveStructure(newStructure);
    };

    const addInsignia = (tramoIndex: number, subtramoIndex: number, indexAt: number, nombre: string, varas: number) => {
        if (!structure) return;
        const newStructure = { ...structure };
        const subtramoActual = newStructure.tramos[tramoIndex].subtramos[subtramoIndex];

        const posiciones: PosicionCortejo[] = [
            { id: uuidv4(), hermanoId: null, papeletaId: null, nombrePuesto: 'Portador' }
        ];

        for (let i = 1; i <= varas; i++) {
            posiciones.push({ id: uuidv4(), hermanoId: null, papeletaId: null, nombrePuesto: `Vara ${i}` });
        }

        const nuevaInsignia: ElementoCortejo = {
            id: uuidv4(),
            tipo: 'INSIGNIA',
            nombre,
            posiciones
        };

        // Insertar en la posición deseada
        subtramoActual.elementos.splice(indexAt, 0, nuevaInsignia);

        // TODO: En una implementación más compleja, esto dividiría el subtramo en dos.
        // Por ahora, lo mantenemos como elementos ordenados dentro del subtramo.

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
