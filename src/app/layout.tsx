import type { Metadata } from "next";
import "./globals.css";
import { InsforgeProvider } from "./providers";

export const metadata: Metadata = {
    title: "Gestor de Hermandades",
    description: "Sistema ERP para gestión integral de Hermandades de Semana Santa",
    manifest: "/manifest.json",
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
