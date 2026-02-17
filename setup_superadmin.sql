
-- 1. Actualizar la función de Administradores
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
    'alarmdryros@gmail.com',  -- ESTE ES TÚ EMAIL PRINCIPAL
    'agente_insforge@test.com',
    'proyectosdryros@gmail.com',
    'proyectoszipi@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Asegurarnos de que el RLS permita acceso total
-- (Esto ya se ejecutó, pero lo reforzamos por si acaso)
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
        -- Recrear políticas de administración
        EXECUTE format('DROP POLICY IF EXISTS admin_all ON public.%I', t);
        EXECUTE format('CREATE POLICY admin_all ON public.%I FOR ALL USING (public.is_admin() OR public.get_user_role() = ''superadmin'')', t);
    END LOOP;
END $$;
