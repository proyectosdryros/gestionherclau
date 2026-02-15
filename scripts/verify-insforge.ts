
import { InsForgeHermanoRepository } from '../src/infrastructure/repositories/insforge/InsForgeHermanoRepository';
import { insforge } from '../src/lib/insforge';
import * as dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '.env.local' });

async function main() {
    console.log('Verifying InsForge connection...');
    console.log('URL:', process.env.NEXT_PUBLIC_INSFORGE_URL);

    // 1. Initial health check or raw query
    const { data, error } = await insforge.from('hermanos').select('count', { count: 'exact', head: true });

    if (error) {
        console.error('Connection failed:', error.message);
        return;
    }

    console.log('Successfully connected to InsForge!');
    console.log('Hermanos count:', data); // data is null for head: true, count is in property

    // 2. Instantiate Repository (Optional, just to check imports)
    try {
        const repo = new InsForgeHermanoRepository();
        console.log('Repository instantiated successfully.');
    } catch (e) {
        console.error('Error instantiating repository:', e);
    }
}

main().catch(console.error);
