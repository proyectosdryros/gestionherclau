
import { createClient } from '@insforge/sdk';

const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL!;
const insforgeAnonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!;

if (!insforgeUrl || !insforgeAnonKey) {
    console.warn('InsForge credentials missing. Check .env.local');
}

export const insforge = createClient({
    baseUrl: insforgeUrl,
    anonKey: insforgeAnonKey,
});
