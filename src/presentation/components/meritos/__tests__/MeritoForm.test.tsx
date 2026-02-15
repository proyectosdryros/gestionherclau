
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MeritoForm } from '../MeritoForm';

// Mock dependencies
vi.mock('@/presentation/components/ui/Button', () => ({
    Button: ({ children, onClick, type, disabled }: any) => (
        <button onClick={onClick} type={type} disabled={disabled}>
            {children}
        </button>
    ),
}));

describe('MeritoForm', () => {
    const mockOnSuccess = vi.fn();
    const mockOnCancel = vi.fn();
    const defaultProps = {
        hermanoId: '123-abc',
        onSuccess: mockOnSuccess,
        onCancel: mockOnCancel,
    };

    it('renders correctly', () => {
        render(<MeritoForm {...defaultProps} />);
        expect(screen.getByLabelText(/tipo/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/puntos/i)).toBeInTheDocument();
    });

    it('validates required fields', async () => {
        render(<MeritoForm {...defaultProps} />);

        // Submit without filling fields
        fireEvent.click(screen.getByText(/guardar/i));

        await waitFor(() => {
            expect(screen.getByText(/descripción debe tener al menos 5 caracteres/i)).toBeInTheDocument();
        });
    });

    it('submits valid data', async () => {
        render(<MeritoForm {...defaultProps} />);

        fireEvent.change(screen.getByLabelText(/tipo/i), { target: { value: 'VOLUNTARIADO' } });
        fireEvent.change(screen.getByLabelText(/descripción/i), { target: { value: 'Voluntariado en evento' } });
        fireEvent.change(screen.getByLabelText(/puntos/i), { target: { value: '10' } });
        fireEvent.change(screen.getByLabelText(/fecha/i), { target: { value: '2023-01-01' } });

        fireEvent.click(screen.getByText(/guardar/i));

        await waitFor(() => {
            expect(mockOnSuccess).toHaveBeenCalledWith(expect.objectContaining({
                tipo: 'VOLUNTARIADO',
                descripcion: 'Voluntariado en evento',
                puntos: 10,
                hermanoId: '123-abc'
            }));
        });
    });

    it('calls onCancel when cancel button is clicked', () => {
        render(<MeritoForm {...defaultProps} />);
        fireEvent.click(screen.getByText(/cancelar/i));
        expect(mockOnCancel).toHaveBeenCalled();
    });
});
