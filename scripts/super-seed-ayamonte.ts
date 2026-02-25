
import { createClient } from '@insforge/sdk';
import { SECTORES_AYAMONTE } from '../src/lib/data/sectores-ayamonte';
import { v4 as uuidv4 } from 'uuid';

const INSFORGE_URL = 'https://xaxy45yt.eu-central.insforge.app';
const INSFORGE_KEY = 'ik_706bfc56a5cdbb6e2363b4280a8f4a17';

const insforge = createClient({
    baseUrl: INSFORGE_URL,
    anonKey: INSFORGE_KEY,
});

const nombres = ['Manuel', 'Jose', 'Maria', 'Carmen', 'Antonio', 'Rocio', 'Francisco', 'Dolores', 'Juan', 'Isabel', 'Rafael', 'Pilar', 'Luis', 'Concepcion', 'Pedro', 'Esperanza', 'Miguel', 'Manuela', 'Angel', 'Josefa'];
const apellidos = ['García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez'];

async function cleanDatabase() {
    console.log('🗑️ Limpiando base de datos...');

    // Borrar en orden para evitar fallos de FK (aunque InsForge suele ser permisivo)
    const tablas = ['recibos', 'papeletas', 'puestos', 'meritos', 'hermanos'];

    for (const tabla of tablas) {
        console.log(`   Borrando ${tabla}...`);
        const { error } = await insforge.database.from(tabla).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) console.error(`   ⚠️ Error borrando ${tabla}:`, error.message);
    }
}

async function seedHermanos(cantidad: number) {
    console.log(`\n🌱 Creando ${cantidad} hermanos con datos geográficos reales...`);

    const nuevosHermanos = [];

    for (let i = 1; i <= cantidad; i++) {
        // Elegir un sector al azar de la lista OFICIAL
        const sector = SECTORES_AYAMONTE[Math.floor(Math.random() * SECTORES_AYAMONTE.length)];

        // Elegir una calle que REALMENTE pertenezca a ese sector
        const calle = sector.calles[Math.floor(Math.random() * sector.calles.length)];

        const nombre = nombres[Math.floor(Math.random() * nombres.length)];
        const apellido1 = apellidos[Math.floor(Math.random() * apellidos.length)];
        const apellido2 = apellidos[Math.floor(Math.random() * apellidos.length)];

        const id = uuidv4();

        nuevosHermanos.push({
            id: id,
            numeroHermano: i,
            nombre: nombre,
            apellido1: apellido1,
            apellido2: apellido2,
            apodo: `${nombre} ${apellido1.substring(0, 3)}`,
            direccion: `${calle}, ${Math.floor(Math.random() * 100) + 1}`,
            distrito: sector.nombre, // Nombre oficial del sector
            telefono: `6${Math.floor(Math.random() * 900000000) + 100000000}`.substring(0, 9),
            dni: null,
            email: null,
            fechaNacimiento: new Date(1960 + Math.floor(Math.random() * 50), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString(),
            fechaAlta: new Date(2010 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString(),
            estado: 'ACTIVO',
            cuotasAlDia: Math.random() > 0.3,
            consentimientos: { datos: true, imagenes: true, comunicaciones: true },
            rol: 'USUARIO',
            auditoria: {
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                version: 1
            }
        });
    }

    // Insertar en bloques para no saturar
    const chunk = 25;
    for (let i = 0; i < nuevosHermanos.length; i += chunk) {
        const batch = nuevosHermanos.slice(i, i + chunk);
        const { error } = await insforge.database.from('hermanos').insert(batch);
        if (error) {
            console.error(`❌ Error insertando bloque ${i / chunk + 1}:`, error.message);
        } else {
            console.log(`✅ Bloque ${i / chunk + 1} insertado (${batch.length} hermanos)`);
        }
    }
}

(async () => {
    try {
        await cleanDatabase();
        await seedHermanos(100);
        console.log('\n✨ ¡Proceso completado con éxito!');
        console.log('Ahora todos los hermanos tienen calles y distritos que COINCIDEN perfectamente.');
    } catch (e) {
        console.error('💥 Error fatal:', e);
    }
})();
