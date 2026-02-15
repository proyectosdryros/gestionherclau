/**
 * DNI Value Object
 * Valida el formato español DNI (8 dígitos + letra)
 */

const DNI_REGEX = /^[0-9]{8}[A-Z]$/;
const DNI_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';

export class DNI {
    private constructor(private readonly value: string) { }

    static create(value: string): DNI {
        const normalized = value.toUpperCase().replace(/\s/g, '');

        if (!DNI_REGEX.test(normalized)) {
            throw new Error('Formato DNI inválido. Debe ser 8 dígitos + letra mayúscula');
        }

        const number = parseInt(normalized.substring(0, 8), 10);
        const letter = normalized.charAt(8);
        const expectedLetter = DNI_LETTERS[number % 23];

        if (letter !== expectedLetter) {
            throw new Error(`Letra de control DNI incorrecta. Esperada: ${expectedLetter}, recibida: ${letter}`);
        }

        return new DNI(normalized);
    }

    getValue(): string {
        return this.value;
    }

    equals(other: DNI): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}
