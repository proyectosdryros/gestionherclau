-- Script para crear tabla de configuración de precios
-- Ejecutar en SQL Editor de Insforge

CREATE TABLE IF NOT EXISTS public.configuracion_precios (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo text NOT NULL, -- CUOTA, PAPELETA_TRAMO, PAPELETA_VARIA, etc.
    nombre text NOT NULL, -- "Cuota Anual", "Papeleta Cirio", etc.
    importe numeric NOT NULL DEFAULT 0,
    anio integer, -- Opcional, para aplicar a años específicos
    activo boolean DEFAULT true,
    auditoria jsonb,
    updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.configuracion_precios ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad (ADMIN y SUPERADMIN gestión total)
DROP POLICY IF EXISTS admin_all ON public.configuracion_precios;
CREATE POLICY admin_all ON public.configuracion_precios FOR ALL USING (public.is_admin() OR public.get_user_role() = 'superadmin');

-- Política de lectura para todos (para poder ver precios al crear recibos)
CREATE POLICY lectura_publica ON public.configuracion_precios FOR SELECT USING (true);
