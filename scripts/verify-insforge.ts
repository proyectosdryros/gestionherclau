
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
    console.log('Verifying InsForge connection...');
    console.log('URL:', process.env.NEXT_PUBLIC_INSFORGE_URL);

    // Import the client directly
    const { insforge } = await import('../src/lib/insforge.ts');

    // Simple count check
    const { data, error } = await insforge.database.from('hermanos').select('count', { count: 'exact', head: true });

    if (error) {
        console.error('Connection failed:', error.message);
        process.exit(1);
    }

    console.log('Successfully connected to the NEW InsForge project!');
    console.log('Table "hermanos" is accessible.');
    console.log('Hermanos count:', data);

    // Check for another table just to be sure
    const costaleros = await insforge.database.from('costaleros').select('count', { count: 'exact', head: true });
    console.log('Table "costaleros" is accessible. Count:', costaleros.data);
}

main().catch(console.error);
