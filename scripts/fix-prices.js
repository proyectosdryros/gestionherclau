const { createClient } = require('@insforge/sdk');
require('dotenv').config({ path: '.env.local' });

const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
const insforgeAnonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

const insforge = createClient({
    baseUrl: insforgeUrl,
    anonKey: insforgeAnonKey,
});

async function fixPrecios() {
    try {
        console.log('Fixing corrupted price types...');
        const { data, error } = await insforge.database
            .from('configuracion_precios')
            .update({ tipo: 'CUOTA' })
            .eq('tipo', 'CUOTA text-slate-900');

        if (error) {
            console.error('Error fixing prices:', error);
            return;
        }

        console.log('Fixed:', data);

        // Final check
        const { data: check } = await insforge.database
            .from('configuracion_precios')
            .select('*')
            .eq('activo', true);

        console.table(check.map(d => ({ tipo: d.tipo, nombre: d.nombre, importe: d.importe })));

    } catch (err) {
        console.error(err);
    }
}

fixPrecios();
