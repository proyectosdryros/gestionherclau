
-- Semilla de precios para Papeletas de Sitio (Año 2024/2025)
-- Esto asegura que el usuario vea todos los tipos disponibles de inmediato

INSERT INTO configuracion_precios (id, tipo, nombre, importe, anio, activo)
VALUES 
  (gen_random_uuid(), 'NAZARENO', 'Papeleta Nazareno', 20.00, 2025, true),
  (gen_random_uuid(), 'VARA', 'Papeleta Vara', 50.00, 2025, true),
  (gen_random_uuid(), 'INSIGNIA', 'Papeleta Insignia / Estandarte', 45.00, 2025, true),
  (gen_random_uuid(), 'BOCINA', 'Papeleta Bocina', 40.00, 2025, true),
  (gen_random_uuid(), 'FAROL', 'Papeleta Farol', 30.00, 2025, true),
  (gen_random_uuid(), 'CRUZ_GUIA', 'Papeleta Cruz de Guía', 60.00, 2025, true),
  (gen_random_uuid(), 'PAPELETA_SITIO', 'Papeleta de Sitio (General)', 15.00, 2025, true),
  (gen_random_uuid(), 'COSTALERO', 'Papeleta de Sitio Costalero', 10.00, 2025, true),
  (gen_random_uuid(), 'PAPELETA_SIMBOLICA', 'Papeleta Simbólica (No sale)', 10.00, 2025, true)
ON CONFLICT DO NOTHING;
