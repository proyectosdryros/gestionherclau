
import { ConfiguracionRepository } from '@/core/ports/repositories/ConfiguracionRepository';
import { ConfiguracionGlobal } from '@/core/domain/entities/ConfiguracionGlobal';
import { Temporada } from '@/core/domain/entities/Temporada';
import { insforge } from '@/lib/insforge';

export class InsForgeConfiguracionRepository implements ConfiguracionRepository {

    async getConfiguracion(clave: string): Promise<ConfiguracionGlobal | null> {
        const { data, error } = await insforge.database
            .from('configuracion_global')
            .select('*')
            .eq('clave', clave)
            .single();

        if (error || !data) return null;

        return new ConfiguracionGlobal(
            data.clave,
            data.valor,
            new Date(data.updated_at)
        );
    }

    async updateConfiguracion(clave: string, valor: any): Promise<void> {
        const { error } = await insforge.database
            .from('configuracion_global')
            .upsert({ clave, valor, updated_at: new Date().toISOString() });

        if (error) throw error;
    }

    async getTemporadas(): Promise<Temporada[]> {
        const { data, error } = await insforge.database
            .from('temporadas')
            .select('*')
            .order('anio', { ascending: false });

        if (error) return [];

        return (data as any[]).map(d => new Temporada(
            d.id,
            d.nombre,
            d.anio,
            d.is_active,
            new Date(d.created_at)
        ));
    }

    async getTemporadaActiva(): Promise<Temporada | null> {
        const { data, error } = await insforge.database
            .from('temporadas')
            .select('*')
            .eq('is_active', true)
            .single();

        if (error || !data) return null;

        return new Temporada(
            data.id,
            data.nombre,
            data.anio,
            data.is_active,
            new Date(data.created_at)
        );
    }

    async iniciarTemporada(anio: number, nombre: string): Promise<void> {
        // 1. Desactivar todas las temporadas actuales
        const { error: errorDeactivation } = await insforge.database
            .from('temporadas')
            .update({ is_active: false })
            .eq('is_active', true);

        if (errorDeactivation) throw errorDeactivation;

        // 2. Crear nueva temporada activa
        const { error: errorCreation } = await insforge.database
            .from('temporadas')
            .insert({
                nombre,
                anio,
                is_active: true
            });

        if (errorCreation) throw errorCreation;

        // 3. Actualizar configuracion_global
        await this.updateConfiguracion('temporada_activa', { anio });
    }

    async actualizarRol(usuarioId: string, nuevoRol: string): Promise<void> {
        const { error } = await insforge.database
            .from('profiles')
            .update({ role: nuevoRol.toUpperCase() })
            .eq('id', usuarioId);

        if (error) throw error;
    }
}
