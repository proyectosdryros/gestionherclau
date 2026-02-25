/**
 * Script para añadir columnas a la tabla hermanos en InsForge
 * Ejecutar con: node scripts/add-columns-hermanos.js
 */

const INSFORGE_URL = 'https://xaxy45yt.eu-central.insforge.app';
const INSFORGE_KEY = 'ik_706bfc56a5cdbb6e2363b4280a8f4a17';

const headers = {
    'apikey': INSFORGE_KEY,
    'Authorization': `Bearer ${INSFORGE_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
};

// Columnas a añadir (nombre, tipo SQL)
const columnas = [
    { nombre: 'distrito', tipo: 'TEXT' },
    { nombre: 'apodo', tipo: 'TEXT' },
    { nombre: 'direccion', tipo: 'TEXT' },
    { nombre: 'rol', tipo: 'TEXT' },
    { nombre: 'user_id', tipo: 'UUID' },
];

async function tryAddColumn(col) {
    // Intentar distintos endpoints que InsForge podría exponer para DDL
    const endpoints = [
        // Endpoint SQL nativo (si InsForge lo expone como Supabase)
        {
            url: `${INSFORGE_URL}/rest/v1/rpc/exec_sql`, method: 'POST',
            body: { query: `ALTER TABLE hermanos ADD COLUMN IF NOT EXISTS ${col.nombre} ${col.tipo};` }
        },
        // Endpoint alternativo
        {
            url: `${INSFORGE_URL}/api/v1/database/query`, method: 'POST',
            body: { sql: `ALTER TABLE hermanos ADD COLUMN IF NOT EXISTS ${col.nombre} ${col.tipo};` }
        },
        // Endpoint de administración
        {
            url: `${INSFORGE_URL}/admin/v1/database/sql`, method: 'POST',
            body: { query: `ALTER TABLE hermanos ADD COLUMN IF NOT EXISTS ${col.nombre} ${col.tipo};` }
        },
    ];

    for (const ep of endpoints) {
        try {
            const res = await fetch(ep.url, {
                method: ep.method,
                headers,
                body: JSON.stringify(ep.body),
            });
            const text = await res.text();
            if (res.ok) {
                return { ok: true, endpoint: ep.url, response: text };
            }
            console.log(`  [${res.status}] ${ep.url}: ${text.slice(0, 120)}`);
        } catch (e) {
            console.log(`  Error en ${ep.url}: ${e.message}`);
        }
    }
    return { ok: false };
}

async function checkExistingColumns() {
    // Pedir 1 fila para ver qué columnas devuelve
    try {
        const res = await fetch(`${INSFORGE_URL}/rest/v1/hermanos?limit=1&select=*`, {
            headers,
        });
        if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
                return Object.keys(data[0]);
            }
        }
    } catch (e) { }
    return null;
}

(async () => {
    console.log('🔍 Verificando columnas existentes en tabla hermanos...');
    const existentes = await checkExistingColumns();
    if (existentes) {
        console.log('✅ Columnas actuales:', existentes.join(', '));
    } else {
        console.log('⚠️  No se pudo leer la tabla. Continuando de todas formas...');
    }

    console.log('\n🔧 Intentando añadir columnas...\n');

    for (const col of columnas) {
        if (existentes && existentes.includes(col.nombre)) {
            console.log(`⏭️  ${col.nombre} (${col.tipo}) — ya existe, saltando`);
            continue;
        }

        console.log(`➕ Añadiendo ${col.nombre} (${col.tipo})...`);
        const result = await tryAddColumn(col);
        if (result.ok) {
            console.log(`✅ ${col.nombre} añadida correctamente via ${result.endpoint}`);
        } else {
            console.log(`❌ No se pudo añadir ${col.nombre} por API automática.`);
        }
    }

    console.log('\n✨ Proceso completado.');
})();
