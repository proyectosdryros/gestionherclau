import type { Metadata } from "next";
import "./globals.css";

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
                {children}
            </body>
        </html>
    );
}
