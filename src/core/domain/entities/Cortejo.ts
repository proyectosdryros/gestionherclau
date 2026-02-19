
export type TipoElementoCortejo = 'INSIGNIA' | 'FILA_NAZARENOS' | 'PASO';

export interface PosicionCortejo {
    id: string;
    hermanoId: string | null;
    papeletaId: string | null;
    nombrePuesto: string;
}

export interface ElementoCortejo {
    id: string;
    tipo: TipoElementoCortejo;
    nombre: string;
    posiciones: PosicionCortejo[]; // 1 para insignia, 2 para fila
}

export interface SubtramoCortejo {
    id: string;
    numero: string; // e.g. "1.1"
    elementos: ElementoCortejo[];
}

export interface TramoCortejo {
    id: string;
    numero: number;
    nombre: string;
    subtramos: SubtramoCortejo[];
}

export interface CortejoStructure {
    id: string;
    temporada: number;
    tramos: TramoCortejo[];
}
