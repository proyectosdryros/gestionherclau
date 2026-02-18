
import { ConfiguracionGlobal } from '@/core/domain/entities/ConfiguracionGlobal';
import { Temporada } from '@/core/domain/entities/Temporada';

export interface ConfiguracionRepository {
    getConfiguracion(clave: string): Promise<ConfiguracionGlobal | null>;
    updateConfiguracion(clave: string, valor: any): Promise<void>;

    getTemporadas(): Promise<Temporada[]>;
    getTemporadaActiva(): Promise<Temporada | null>;
    iniciarTemporada(anio: number, nombre: string): Promise<void>;

    // Gestión de Roles (pueden ser parte de un PersonaRepository, pero los centralizo aquí por ahora)
    actualizarRol(usuarioId: string, nuevoRol: string): Promise<void>;
}
