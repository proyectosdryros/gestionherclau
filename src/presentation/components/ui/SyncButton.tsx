
'use client';

import React from 'react';
import { RefreshCw, CloudCheck, CloudOff, AlertCircle } from 'lucide-react';
import { useSync } from '@/presentation/hooks/useSync';
import { Button } from '@/presentation/components/ui/Button';

export function SyncButton() {
    const { isSyncing, error, performSync } = useSync();

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                size="sm"
                onClick={performSync}
                disabled={isSyncing}
                title="Sincronizar datos con la nube"
                className="flex items-center gap-2"
            >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? (
                    <span className="text-xs">Sincronizando...</span>
                ) : error ? (
                    <span className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Error
                    </span>
                ) : (
                    <span className="text-xs">Sincronizar</span>
                )}
            </Button>

            <div className="flex items-center">
                {error ? (
                    <CloudOff className="w-4 h-4 text-red-500" />
                ) : isSyncing ? (
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
                ) : (
                    <CloudCheck className="w-4 h-4 text-green-500" />
                )}
            </div>
        </div>
    );
}
