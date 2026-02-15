export default function HomePage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-primary mb-4">
                    Sistema Gestor de Hermandades
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                    v2.0 - Arquitectura Offline-First
                </p>
                <div className="flex gap-4 justify-center">
                    <a
                        href="/dashboard"
                        className="rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        Acceder al Dashboard
                    </a>
                </div>
            </div>
        </main>
    );
}
