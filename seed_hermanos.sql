-- Script para insertar 10 hermanos de prueba sin DNI ni Email
-- Ejecutar en el SQL Editor de Insforge

INSERT INTO public.hermanos (
    "numeroHermano",
    nombre,
    "apellido1",
    "apellido2",
    dni,
    email,
    telefono,
    "fechaNacimiento",
    "fechaAlta",
    estado,
    "cuotasAlDia",
    consentimientos,
    auditoria
) VALUES
(1001, 'Antonio', 'García', 'López', NULL, NULL, '600000001', '1980-01-01', CURRENT_DATE, 'ACTIVO', true, '{"datos": true, "imagenes": true, "comunicaciones": false}', '{"version": 1, "created_at": "2024-01-01T00:00:00Z", "updated_at": "2024-01-01T00:00:00Z"}'),
(1002, 'Manuel', 'Rodríguez', 'Sánchez', NULL, NULL, '600000002', '1985-05-15', CURRENT_DATE, 'ACTIVO', true, '{"datos": true, "imagenes": true, "comunicaciones": true}', '{"version": 1, "created_at": "2024-01-01T00:00:00Z", "updated_at": "2024-01-01T00:00:00Z"}'),
(1003, 'Jose', 'Martínez', 'Ruiz', NULL, NULL, NULL, '1990-10-20', CURRENT_DATE, 'ACTIVO', false, '{"datos": true, "imagenes": false, "comunicaciones": false}', '{"version": 1, "created_at": "2024-01-01T00:00:00Z", "updated_at": "2024-01-01T00:00:00Z"}'),
(1004, 'Francisco', 'Fernández', 'Gómez', NULL, NULL, '600000004', '1975-03-10', CURRENT_DATE, 'ACTIVO', true, '{"datos": true, "imagenes": true, "comunicaciones": true}', '{"version": 1, "created_at": "2024-01-01T00:00:00Z", "updated_at": "2024-01-01T00:00:00Z"}'),
(1005, 'Juan', 'González', 'Díaz', NULL, NULL, NULL, '1995-07-25', CURRENT_DATE, 'ACTIVO', true, '{"datos": true, "imagenes": true, "comunicaciones": false}', '{"version": 1, "created_at": "2024-01-01T00:00:00Z", "updated_at": "2024-01-01T00:00:00Z"}'),
(1006, 'David', 'Pérez', 'Moreno', NULL, NULL, '600000006', '1988-12-05', CURRENT_DATE, 'ACTIVO', false, '{"datos": true, "imagenes": false, "comunicaciones": true}', '{"version": 1, "created_at": "2024-01-01T00:00:00Z", "updated_at": "2024-01-01T00:00:00Z"}'),
(1007, 'Javier', 'Sánchez', 'Álvarez', NULL, NULL, '600000007', '2000-02-14', CURRENT_DATE, 'ACTIVO', true, '{"datos": true, "imagenes": true, "comunicaciones": true}', '{"version": 1, "created_at": "2024-01-01T00:00:00Z", "updated_at": "2024-01-01T00:00:00Z"}'),
(1008, 'Miguel', 'Romero', 'Navarro', NULL, NULL, NULL, '1970-08-30', CURRENT_DATE, 'ACTIVO', true, '{"datos": true, "imagenes": true, "comunicaciones": false}', '{"version": 1, "created_at": "2024-01-01T00:00:00Z", "updated_at": "2024-01-01T00:00:00Z"}'),
(1009, 'Carlos', 'Torres', 'Serrano', NULL, NULL, '600000009', '1982-11-11', CURRENT_DATE, 'ACTIVO', true, '{"datos": true, "imagenes": false, "comunicaciones": true}', '{"version": 1, "created_at": "2024-01-01T00:00:00Z", "updated_at": "2024-01-01T00:00:00Z"}'),
(1010, 'Rafael', 'Ruiz', 'Molina', NULL, NULL, '600000010', '1992-06-01', CURRENT_DATE, 'ACTIVO', true, '{"datos": true, "imagenes": true, "comunicaciones": true}', '{"version": 1, "created_at": "2024-01-01T00:00:00Z", "updated_at": "2024-01-01T00:00:00Z"}');
