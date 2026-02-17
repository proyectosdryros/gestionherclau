
'use client';

import React from 'react';
import { BlobProvider } from '@react-pdf/renderer';
import { Button } from '@/presentation/components/ui/Button';
import { Printer, Loader2 } from 'lucide-react';
import { PapeletaDocument } from './PapeletaDocument';

interface PDFDownloadButtonProps {
    papeleta: any;
    hermano: any;
}

export const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({ papeleta, hermano }) => {
    const [isReady, setIsReady] = React.useState(false);

    React.useEffect(() => {
        setIsReady(true);
    }, []);

    const handleDownload = (blob: Blob | null) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Papeleta_${hermano.nombre}_${hermano.apellido1}_${papeleta.anio}.pdf`.replace(/\s+/g, '_');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (!isReady) {
        return (
            <Button disabled className="flex-1 h-16 rounded-2xl bg-slate-100 text-slate-400 font-bold border-none">
                Preparando...
            </Button>
        );
    }

    return (
        <BlobProvider document={<PapeletaDocument papeleta={papeleta} hermano={hermano} />}>
            {({ blob, loading, error }) => {
                if (error) {
                    console.error('Error en BlobProvider:', error);
                    return (
                        <Button
                            variant="destructive"
                            className="flex-1 h-16 rounded-2xl gap-3"
                            onClick={() => window.location.reload()}
                        >
                            Error. Pulsa para reintentar
                        </Button>
                    );
                }

                return (
                    <Button
                        className="flex-1 h-16 rounded-2xl bg-slate-900 text-white hover:bg-black font-black text-lg gap-3"
                        disabled={loading}
                        onClick={() => handleDownload(blob)}
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Printer className="w-6 h-6" />}
                        {loading ? 'CARGANDO PDF...' : 'DESCARGAR SOUVENIR'}
                    </Button>
                );
            }}
        </BlobProvider>
    );
};
