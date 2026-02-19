import type { Metadata, Viewport } from "next";
import "./globals.css";
import { InsforgeProvider } from "./providers";

export const metadata: Metadata = {
    title: "Gestor de Hermandades",
    description: "Sistema ERP para gestión integral de Hermandades de Semana Santa",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Gestor Hermandades'
    }
};

export const viewport: Viewport = {
    themeColor: "#020617",
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className="antialiased">
                <InsforgeProvider>
                    {children}
                </InsforgeProvider>
            </body>
        </html>
    );
}
