const { createClient } = require('@insforge/sdk');
require('dotenv').config({ path: '.env.local' });

const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
const insforgeAnonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

const insforge = createClient({
    baseUrl: insforgeUrl,
    anonKey: insforgeAnonKey,
});

async function checkPrecios() {
    try {
        console.log('Querying prices...');
        const { data, error } = await insforge.database
            .from('configuracion_precios')
            .select('*')
            .eq('activo', true);

        if (error) {
            console.error('Error:', error);
            return;
        }

        console.log('ACTIVE PRICES:');
        console.table(data.map(d => ({
            id: d.id,
            tipo: d.tipo,
            nombre: d.nombre,
            importe: d.importe
        })));
    } catch (err) {
        console.error(err);
    }
}

checkPrecios();
