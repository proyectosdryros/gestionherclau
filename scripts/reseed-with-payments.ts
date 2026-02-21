
import { createClient } from '@insforge/sdk';
import * as dotenv from 'dotenv';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
const insforgeAnonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

if (!insforgeUrl || !insforgeAnonKey) {
    console.error('Error: Credenciales de InsForge no encontradas.');
    process.exit(1);
}

const insforge = createClient({
    baseUrl: insforgeUrl,
    anonKey: insforgeAnonKey,
});

async function reseed() {
    console.log('--- REINICIANDO CON DATOS REALES DE TESORERÍA ---');

    // 1. Limpiar
    const tables = ['pagos', 'recibos', 'papeletas', 'hermanos'];
    for (const table of tables) {
        await insforge.database.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }

    // 2. Generar Hermanos
    const apellidos = ['García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martin', 'Jiménez', 'Ruiz', 'Hernández', 'Diaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez'];
    const nombres = ['Antonio', 'Manuel', 'José', 'Francisco', 'David', 'Juan', 'Javier', 'Daniel', 'José Luis', 'Alejandro', 'Jesús', 'Ángel', 'Ricardo', 'Fernando', 'Miguel', 'Felipe', 'Santiago', 'Iván', 'Sergio', 'Roberto'];

    const hermanos = [];
    const baseDateAlta = new Date('1950-01-01');

    for (let i = 1; i <= 100; i++) {
        const id = uuidv4();
        const fechaAlta = new Date(baseDateAlta.getTime());
        fechaAlta.setMonth(fechaAlta.getMonth() + (i * 2));

        const edadAlEntrar = Math.floor(Math.random() * 41);
        const fechaNacimiento = new Date(fechaAlta.getTime());
        fechaNacimiento.setFullYear(fechaNacimiento.getFullYear() - edadAlEntrar);

        // El 80% están al día en el flag cacheado, el 20% no
        const cuotasAlDia = Math.random() > 0.2;

        hermanos.push({
            id,
            numeroHermano: i,
            nombre: nombres[i % nombres.length],
            apellido1: apellidos[i % apellidos.length],
            apellido2: apellidos[(i + 1) % apellidos.length],
            dni: null,
            email: null,
            telefono: `600${String(i).padStart(6, '0')}`,
            fechaNacimiento: fechaNacimiento.toISOString().split('T')[0],
            fechaAlta: fechaAlta.toISOString(),
            estado: 'ACTIVO',
            cuotasAlDia: cuotasAlDia,
            consentimientos: { datos: true, imagenes: true, comunicaciones: true },
            auditoria: { created_at: new Date().toISOString(), updated_at: new Date().toISOString(), version: 1 }
        });
    }

    // Insertar hermanos
    for (let i = 0; i < hermanos.length; i += 20) {
        await insforge.database.from('hermanos').insert(hermanos.slice(i, i + 20));
    }
    console.log('100 Hermanos creados.');

    // 3. Generar Recibos (Cuotas)
    console.log('Generando recibos de cuotas...');
    const recibos = [];
    const anioActual = 2026;

    for (const h of hermanos) {
        // Todos tienen el recibo de la cuota anual
        const estaPagado = h.cuotasAlDia; // Sincronizamos con el flag para el ejemplo

        recibos.push({
            id: uuidv4(),
            hermanoId: h.id,
            concepto: `Cuota Anual ${anioActual}`,
            importe: 30,
            fechaEmision: `${anioActual}-01-01`,
            estado: estaPagado ? 'PAGADO' : 'PENDIENTE',
            tipo: 'CUOTA',
            auditoria: { created_at: new Date().toISOString(), updated_at: new Date().toISOString(), version: 1 }
        });

        // Algunos tienen una deuda extra (ej: papeleta pendiente)
        if (!estaPagado && Math.random() > 0.6) {
            recibos.push({
                id: uuidv4(),
                hermanoId: h.id,
                concepto: 'Papeleta de Sitio 2025 (Atrasada)',
                importe: 20,
                fechaEmision: '2025-03-15',
                estado: 'PENDIENTE',
                tipo: 'PAPELETA_SITIO',
                auditoria: { created_at: new Date().toISOString(), updated_at: new Date().toISOString(), version: 1 }
            });
        }
    }

    // Insertar recibos
    for (let i = 0; i < recibos.length; i += 50) {
        await insforge.database.from('recibos').insert(recibos.slice(i, i + 50));
    }

    console.log(`${recibos.length} recibos generados.`);
    console.log('--- RESEED FINALIZADO ---');
}

reseed().catch(console.error);
