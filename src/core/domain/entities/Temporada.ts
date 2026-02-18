
export class Temporada {
    constructor(
        public readonly id: string,
        public readonly nombre: string,
        public readonly anio: number,
        public readonly is_active: boolean,
        public readonly created_at: Date
    ) { }

    static create(id: string, nombre: string, anio: number, is_active: boolean = false): Temporada {
        return new Temporada(id, nombre, anio, is_active, new Date());
    }
}
