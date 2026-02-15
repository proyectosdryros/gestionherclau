
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MeritosList } from '../MeritosList';
import { Merito, TipoMerito } from '@/core/domain/entities/Merito';

// Mock dependencies
vi.mock('@/presentation/components/ui/Modal', () => ({
    Modal: ({ children, isOpen, title }: any) => (isOpen ? <div title={title}>{children}</div> : null),
}));
vi.mock('@/presentation/components/ui/Card', () => ({
    Card: ({ children }: any) => <div>{children}</div>,
    CardHeader: ({ children }: any) => <div>{children}</div>,
    CardTitle: ({ children }: any) => <div>{children}</div>,
    CardContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('lucide-react', () => ({
    Plus: () => <span>+</span>,
    Trash2: () => <span>Trash</span>,
    Award: () => <span>Award</span>,
}));

describe('MeritosList', () => {
    const mockOnCreate = vi.fn();
    const mockOnDelete = vi.fn();

    const mockMerito = new Merito(
        '1',
        'hermano-1',
        'VOLUNTARIADO' as TipoMerito,
        'Ayuda en misa',
        5,
        new Date(),
        null,
        { created_at: new Date(), updated_at: new Date(), version: 1 }
    );

    const defaultProps = {
        hermanoId: 'hermano-1',
        meritos: [mockMerito],
        onCreate: mockOnCreate,
        onDelete: mockOnDelete,
    };

    it('renders merito list', () => {
        render(<MeritosList {...defaultProps} />);
        expect(screen.getByText('Ayuda en misa')).toBeInTheDocument();
    });

    it('renders empty state when no meritos', () => {
        render(<MeritosList {...defaultProps} meritos={[]} />);
        expect(screen.getByText(/no hay méritos registrados/i)).toBeInTheDocument();
    });

    it('opens modal when clicking add button', () => {
        render(<MeritosList {...defaultProps} />);
        fireEvent.click(screen.getByText(/añadir mérito/i));
        expect(screen.getByText(/registrar nuevo mérito/i)).toBeInTheDocument(); // Title from Modal mock
    });

    it('calls onDelete when delete button is clicked and confirmed', async () => {
        // Mock window.confirm
        const confirmSpy = vi.spyOn(window, 'confirm');
        confirmSpy.mockImplementation(() => true);

        render(<MeritosList {...defaultProps} />);
        fireEvent.click(screen.getByText(/eliminar/i));

        expect(confirmSpy).toHaveBeenCalled();
        expect(mockOnDelete).toHaveBeenCalledWith('1');

        confirmSpy.mockRestore();
    });
});
