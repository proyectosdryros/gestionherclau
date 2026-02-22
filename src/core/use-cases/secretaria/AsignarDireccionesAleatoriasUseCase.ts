/**
 * Use Case: Asignar Direcciones Aleatorias (Ayamonte)
 * Asigna una dirección aleatoria de Ayamonte a todos los hermanos que no tengan una.
 */

import { HermanoRepository } from '@/core/ports/repositories/HermanoRepository';

const CALLES_AYAMONTE = [
    'Av. Alcalde Narciso Martín Navarro',
    'Av. Cayetano Feu',
    'Av. de Andalucía',
    'Av. de Juan Pablo II',
    'Av. de la Constitución',
    'Av. de la Mojarra',
    'Av. de la Playa',
    'Av. de los Cisnes',
    'Av. de los Gavilanes',
    'Av. de Nuestra Señora del Carmen',
    'Av. de Palmera Punta del Moral',
    'Av. de Ramón y Cajal',
    'Av. de Rosalía de Castro',
    'Av. de San Antonio',
    'Av. del Alcalde Manuel Flores',
    'Av. del Camino Real',
    'Av. del Muelle de Portugal',
    'Av. del Muelle Norte',
    'Calle Antonio Concepción Reboura',
    'Calle Acacia',
    'Calle Aduana',
    'Calle Aire',
    'Calle Alajar',
    'Calle Albahaca',
    'Calle Alicante',
    'Calle Almendro',
    'Calle Almería',
    'Calle Amador Jiménez',
    'Calle Angustias',
    'Calle Aracena',
    'Calle Bailén',
    'Calle Betis',
    'Calle Bollullos del Condado',
    'Calle Bonares',
    'Calle Buenavista',
    'Calle Cádiz',
    'Calle Calañas',
    'Calle Calderón de la Barca',
    'Calle Carmen',
    'Calle Cartaya',
    'Calle Cristóbal Colón',
    'Calle Cuna',
    'Calle de las Flores',
    'Calle Galdames',
    'Calle Galicia',
    'Calle Gibraleón',
    'Calle Goya',
    'Calle Granada',
    'Calle Gurugú',
    'Calle Huelva',
    'Calle Isla Cristina',
    'Calle Islas Canarias',
    'Calle Jacinto Benavente',
    'Calle Jaén',
    'Calle Jardín',
    'Calle Jorge Guillén',
    'Calle Jovellanos',
    'Calle Juan de la Cierva',
    'Calle Juan Fernández',
    'Calle Lepanto',
    'Calle Lepe',
    'Calle Lola Martín',
    'Calle Lope de Vega',
    'Calle Naranjo',
    'Calle Nerva',
    'Calle Olivo',
    'Calle Pablo Picasso',
    'Calle Real',
    'Calle San Juan',
    'Calle San Mateo',
    'Calle San Pedro',
    'Calle San Roque',
    'Calle San Sebastián',
    'Calle Santa Clara',
    'Calle Santa Lucía',
    'Calle Sevilla',
    'Calle Soledad',
    'Plaza de la Laguna',
    'Plaza de la Ribera'
];

export class AsignarDireccionesAleatoriasUseCase {
    constructor(private readonly hermanoRepository: HermanoRepository) { }

    async execute(): Promise<void> {
        console.log('Iniciando asignación de direcciones aleatorias de Ayamonte...');

        const todos = await this.hermanoRepository.findAll({ estado: 'ACTIVO' });
        const actualizaciones = [];

        for (const hermano of todos) {
            // Solo asignar si no tiene dirección (opcional, el usuario pidió a todos los activos)
            const calle = CALLES_AYAMONTE[Math.floor(Math.random() * CALLES_AYAMONTE.length)];
            const numero = Math.floor(Math.random() * 150) + 1;
            const piso = Math.random() > 0.5 ? `, ${Math.floor(Math.random() * 5) + 1}º${['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]}` : '';

            const direccionAleatoria = `${calle}, ${numero}${piso}, 21400 Ayamonte (Huelva)`;

            actualizaciones.push(hermano.update({ direccion: direccionAleatoria }));
        }

        if (actualizaciones.length > 0) {
            console.log(`Actualizando ${actualizaciones.length} hermanos con direcciones de Ayamonte...`);
            await this.hermanoRepository.updateMany(actualizaciones);
        }

        console.log('Asignación completada.');
    }
}
