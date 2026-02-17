
-- 1. Limpieza de tablas antiguas o incorrectas
DROP TABLE IF EXISTS asistencias, costaleros, enseres, eventos, familiares, hermanos, meritos, movimientos_enseres, muda_nombres, notificaciones, pagos, papeletas, perfil_trabajaderas, puestos, recibos, relevos, repertorios, temporadas, identificate_aqui, TABLA_QUE_VAS_A_VER_SI_O_SI CASCADE;

-- 2. Creación de Tablas CORRECTAS (Solo Gestión Hermandad)

-- Tabla: hermanos
CREATE TABLE IF NOT EXISTS public.hermanos (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid, -- Vinculación con auth.users
    "numeroHermano" integer,
    nombre text NOT NULL,
    apellido1 text NOT NULL,
    apellido2 text,
    apodo text,
    dni text,
    email text,
    telefono text,
    "fechaNacimiento" date,
    "fechaAlta" date NOT NULL,
    estado text NOT NULL DEFAULT 'alta', -- alta, baja
    "cuotasAlDia" boolean DEFAULT true,
    consentimientos jsonb,
    auditoria jsonb,
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabla: familiares (Relacionado con Hermanos)
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

-- Tabla: puestos (Cargos o puestos en cofradía)
CREATE TABLE IF NOT EXISTS public.puestos (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre text NOT NULL,
    categoria text NOT NULL, -- presidencia, insignia, etc.
    seccion text, -- cristo, virgen
    capacidad integer DEFAULT 1,
    "ordenInSection" integer,
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabla: papeletas (Solicitudes de sitio)
CREATE TABLE IF NOT EXISTS public.papeletas (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "hermanoId" uuid REFERENCES public.hermanos(id) ON DELETE CASCADE,
    anio integer NOT NULL,
    "fechaSolicitud" date NOT NULL DEFAULT CURRENT_DATE,
    "puestoSolicitadoId" uuid REFERENCES public.puestos(id),
    "puestoAsignadoId" uuid REFERENCES public.puestos(id),
    estado text NOT NULL DEFAULT 'solicitada', -- solicitada, asignada, pagada, retirada
    "esAsignacionManual" boolean DEFAULT false,
    observaciones text,
    auditoria jsonb,
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabla: recibos (Cobros a hermanos)
CREATE TABLE IF NOT EXISTS public.recibos (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "hermanoId" uuid REFERENCES public.hermanos(id) ON DELETE CASCADE,
    concepto text NOT NULL,
    importe numeric NOT NULL,
    "fechaEmision" date NOT NULL DEFAULT CURRENT_DATE,
    "fechaVencimiento" date,
    estado text NOT NULL DEFAULT 'pendiente', -- pendiente, pagado, anulado
    tipo text NOT NULL, -- cuota, papeleta, donativo
    observaciones text,
    auditoria jsonb,
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabla: pagos (Detalle de pagos de recibos)
CREATE TABLE IF NOT EXISTS public.pagos (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "reciboId" uuid REFERENCES public.recibos(id) ON DELETE CASCADE,
    "fechaPago" date NOT NULL DEFAULT CURRENT_DATE,
    importe numeric NOT NULL,
    "metodoPago" text NOT NULL, -- efectivo, banco, tarjeta
    "referenciaExterna" text,
    observaciones text,
    auditoria jsonb,
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabla: enseres (Inventario)
CREATE TABLE IF NOT EXISTS public.enseres (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre text NOT NULL,
    descripcion text,
    categoria text NOT NULL,
    ubicacion text NOT NULL,
    estado text NOT NULL DEFAULT 'bueno',
    "fechaAdquisicion" date,
    "valorEstimado" numeric,
    auditoria jsonb,
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabla: meritos (Puntos o antigüedad)
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

-- Tabla de verificación
CREATE TABLE IF NOT EXISTS public.IDENTIFICATE_AQUI (mensaje text);
INSERT INTO public.IDENTIFICATE_AQUI (mensaje) VALUES ('Proyecto GESTION HERMANDAD configurado correctamente.');

-- 3. Funciones de Seguridad (Roles)

-- Función Simple para detectar Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
DECLARE
  claims jsonb;
BEGIN
  -- Intentar obtener los claims del JWT de la configuración actual
  BEGIN
    claims := current_setting('request.jwt.claims', true)::jsonb;
  EXCEPTION WHEN OTHERS THEN
    RETURN false;
  END;
  
  IF claims IS NULL THEN
    RETURN false;
  END IF;

  RETURN (claims ->> 'email') IN (
    'agente_insforge@test.com',
    'proyectosdryros@gmail.com',
    'proyectoszipi@gmail.com',
    'alarmdryros@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rol del usuario
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
DECLARE
BEGIN
  IF public.is_admin() THEN
    RETURN 'superadmin';
  END IF;
  
  -- Verificar si es hermano vinculado
  IF EXISTS (SELECT 1 FROM public.hermanos WHERE user_id = auth.uid()) THEN
    RETURN 'hermano';
  END IF;

  RETURN 'anonimo';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Activar RLS en todas las tablas
ALTER TABLE public.hermanos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.familiares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.puestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.papeletas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recibos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enseres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meritos ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Seguridad (ADMIN LO VE TODO)
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN ('identificate_aqui')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS admin_all ON public.%I', t);
        EXECUTE format('CREATE POLICY admin_all ON public.%I FOR ALL USING (public.is_admin() OR public.get_user_role() = ''superadmin'')', t);
    END LOOP;
END $$;

-- Política básica de lectura para Hermanos (solo sus propios datos)
CREATE POLICY ver_propio_hermano ON public.hermanos FOR SELECT USING (auth.uid() = user_id);
-- (Se pueden añadir más políticas específicas según necesidad)
