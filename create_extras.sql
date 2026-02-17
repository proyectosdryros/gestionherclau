-- Script para asegurar TABLAS EXTRA (Familiares y Meritos)
-- Ejecutar en SQL Editor de Insforge

-- Tabla: familiares
CREATE TABLE IF NOT EXISTS public.familiares (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "hermanoId" uuid REFERENCES public.hermanos(id) ON DELETE CASCADE,
    nombre text NOT NULL,
    apellido1 text NOT NULL,
    apellido2 text,
    "fechaNacimiento" date,
    tipo text NOT NULL, -- conyuge, hijo, padre...
    observaciones text,
    auditoria jsonb,
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabla: meritos
CREATE TABLE IF NOT EXISTS public.meritos (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "hermanoId" uuid REFERENCES public.hermanos(id) ON DELETE CASCADE,
    fecha date NOT NULL,
    tipo text NOT NULL,
    descripcion text NOT NULL,
    puntos integer DEFAULT 0,
    observaciones text,
    auditoria jsonb,
    updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar seguridad (por si acaso)
ALTER TABLE public.familiares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meritos ENABLE ROW LEVEL SECURITY;

-- Políticas de ADMIN (borrar previas para evitar duplicados)
DROP POLICY IF EXISTS admin_all ON public.familiares;
CREATE POLICY admin_all ON public.familiares FOR ALL USING (public.is_admin() OR public.get_user_role() = 'superadmin');

DROP POLICY IF EXISTS admin_all ON public.meritos;
CREATE POLICY admin_all ON public.meritos FOR ALL USING (public.is_admin() OR public.get_user_role() = 'superadmin');
