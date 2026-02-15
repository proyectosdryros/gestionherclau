/**
 * Antigüedad Value Object
 * Calcula y representa la antigüedad de un hermano
 */

export class Antiguedad {
    private constructor(
        private readonly fechaAlta: Date,
        private readonly antiguedadEnMeses: number
    ) { }

    static create(fechaAlta: Date): Antiguedad {
        const now = new Date();
        const meses = this.calcularMeses(fechaAlta, now);
        return new Antiguedad(fechaAlta, meses);
    }

    private static calcularMeses(desde: Date, hasta: Date): number {
        const años = hasta.getFullYear() - desde.getFullYear();
        const meses = hasta.getMonth() - desde.getMonth();
        return años * 12 + meses;
    }

    getAños(): number {
        return Math.floor(this.antiguedadEnMeses / 12);
    }

    getMeses(): number {
        return this.antiguedadEnMeses % 12;
    }

    getTotalMeses(): number {
        return this.antiguedadEnMeses;
    }

    getFechaAlta(): Date {
        return this.fechaAlta;
    }

    /**
     * Puntuación para el algoritmo de asignación
     * Formula: antiguedad_points = (años × 12 + meses)
     */
    getPuntuacion(): number {
        return this.antiguedadEnMeses;
    }

    toString(): string {
        const años = this.getAños();
        const meses = this.getMeses();

        if (años === 0) {
            return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
        }

        if (meses === 0) {
            return `${años} ${años === 1 ? 'año' : 'años'}`;
        }

        return `${años} ${años === 1 ? 'año' : 'años'} y ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    }
}
