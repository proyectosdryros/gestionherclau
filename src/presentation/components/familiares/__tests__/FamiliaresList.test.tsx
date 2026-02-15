
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FamiliaresList } from '../FamiliaresList';
import { Familiar, TipoFamiliar } from '@/core/domain/entities/Familiar';

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
    User: () => <span>User</span>,
}));

describe('FamiliaresList', () => {
    const mockOnCreate = vi.fn();
    const mockOnDelete = vi.fn();

    const mockFamiliar = new Familiar(
        '1',
        'hermano-1',
        'Juan',
        'Pérez',
        null,
        'HIJO' as TipoFamiliar,
        null,
        null,
        { created_at: new Date(), updated_at: new Date(), version: 1 }
    );

    const defaultProps = {
        hermanoId: 'hermano-1',
        familiares: [mockFamiliar],
        onCreate: mockOnCreate,
        onDelete: mockOnDelete,
    };

    it('renders familiar list', () => {
        render(<FamiliaresList {...defaultProps} />);
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    it('renders empty state when no familiares', () => {
        render(<FamiliaresList {...defaultProps} familiares={[]} />);
        expect(screen.getByText(/no hay familiares registrados/i)).toBeInTheDocument();
    });

    it('opens modal when clicking add button', () => {
        render(<FamiliaresList {...defaultProps} />);
        fireEvent.click(screen.getByText(/añadir familiar/i));
        expect(screen.getByText(/registrar nuevo familiar/i)).toBeInTheDocument(); // Title from Modal mock
    });

    it('calls onDelete when delete button is clicked and confirmed', async () => {
        // Mock window.confirm
        const confirmSpy = vi.spyOn(window, 'confirm');
        confirmSpy.mockImplementation(() => true);

        render(<FamiliaresList {...defaultProps} />);
        fireEvent.click(screen.getByText(/eliminar/i));

        expect(confirmSpy).toHaveBeenCalled();
        expect(mockOnDelete).toHaveBeenCalledWith('1');

        confirmSpy.mockRestore();
    });
});
