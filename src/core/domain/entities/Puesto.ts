
export type CategoriaPuesto = 'CIRIO' | 'VARA' | 'INSIGNIA' | 'MANIGUETA' | 'ACOMPAÑANTE' | 'COSTALERO' | 'ACÓLITO' | 'CAPATAZ' | 'BANDA';

export class Puesto {
    constructor(
        public readonly id: string,
        public readonly nombre: string,
        public readonly categoria: CategoriaPuesto,
        public readonly capacidad: number,
        public readonly ordenInSection: number,
        public readonly seccion?: string
    ) { }
}
