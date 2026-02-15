
import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'outline' | 'success' | 'warning' | 'destructive';
}

export function Badge({ children, variant = 'default', className, ...props }: BadgeProps) {
    const variants = {
        default: 'bg-primary text-primary-foreground',
        outline: 'border border-input bg-background',
        success: 'bg-green-500/10 text-green-600 border border-green-500/20',
        warning: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
        destructive: 'bg-destructive/10 text-destructive border border-destructive/20',
    };

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
