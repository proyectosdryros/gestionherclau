
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FamiliarForm } from '../FamiliarForm';
import { TipoFamiliar } from '@/core/domain/entities/Familiar';

// Mock dependencies
vi.mock('@/presentation/components/ui/Button', () => ({
    Button: ({ children, onClick, type, disabled }: any) => (
        <button onClick={onClick} type={type} disabled={disabled}>
            {children}
        </button>
    ),
}));

describe('FamiliarForm', () => {
    const mockOnSuccess = vi.fn();
    const mockOnCancel = vi.fn();
    const defaultProps = {
        hermanoId: '123-abc',
        onSuccess: mockOnSuccess,
        onCancel: mockOnCancel,
    };

    it('renders correctly', () => {
        render(<FamiliarForm {...defaultProps} />);
        expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/primer apellido/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/relación/i)).toBeInTheDocument();
    });

    it('validates required fields', async () => {
        render(<FamiliarForm {...defaultProps} />);

        // Submit without filling fields
        fireEvent.click(screen.getByText(/guardar/i));

        await waitFor(() => {
            expect(screen.getByText(/nombre es requerido/i)).toBeInTheDocument();
            expect(screen.getByText(/primer apellido es requerido/i)).toBeInTheDocument();
        });
    });

    it('submits valid data', async () => {
        render(<FamiliarForm {...defaultProps} />);

        fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Juan' } });
        fireEvent.change(screen.getByLabelText(/primer apellido/i), { target: { value: 'Pérez' } });
        fireEvent.change(screen.getByLabelText(/relación/i), { target: { value: 'HIJO' } });

        fireEvent.click(screen.getByText(/guardar/i));

        await waitFor(() => {
            expect(mockOnSuccess).toHaveBeenCalledWith(expect.objectContaining({
                nombre: 'Juan',
                apellido1: 'Pérez',
                tipo: 'HIJO',
                hermanoId: '123-abc'
            }));
        });
    });

    it('calls onCancel when cancel button is clicked', () => {
        render(<FamiliarForm {...defaultProps} />);
        fireEvent.click(screen.getByText(/cancelar/i));
        expect(mockOnCancel).toHaveBeenCalled();
    });
});
