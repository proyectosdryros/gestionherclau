/**
 * Email Value Object
 * Valida formato de correo electrónico
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
    private constructor(private readonly value: string) { }

    static create(value: string): Email {
        const normalized = value.toLowerCase().trim();

        if (!EMAIL_REGEX.test(normalized)) {
            throw new Error('Formato de email inválido');
        }

        return new Email(normalized);
    }

    getValue(): string {
        return this.value;
    }

    equals(other: Email): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }

    getDomain(): string {
        return this.value.split('@')[1];
    }
}
