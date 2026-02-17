
'use client';

import { SignIn } from '@insforge/nextjs';

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Gestión Hermandad
                    </h1>
                    <p className="mt-2 text-sm text-zinc-400">
                        Inicia sesión para acceder al sistema
                    </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl flex justify-center">
                    <SignIn />
                </div>
            </div>
        </div>
    );
}
