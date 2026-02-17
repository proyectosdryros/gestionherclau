-- FIX PARA ERROR 'function auth.jwt() does not exist'
-- Ejecuta este script en el editor SQL de Insforge

-- 1. Redefinir la función is_admin de forma segura
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
DECLARE
  claims jsonb;
BEGIN
  -- Obtener claims de forma segura sin depender de auth.jwt()
  BEGIN
    claims := current_setting('request.jwt.claims', true)::jsonb;
  EXCEPTION WHEN OTHERS THEN
    RETURN false;
  END;
  
  IF claims IS NULL THEN
    RETURN false;
  END IF;

  -- Lista de correos administradores
  RETURN (claims ->> 'email') IN (
    'alarmdryros@gmail.com',
    'agente_insforge@test.com',
    'proyectosdryros@gmail.com',
    'proyectoszipi@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Asegurar que las politicas se actualizan
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('papeletas', 'recibos', 'hermanos')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS admin_all ON public.%I', t);
        EXECUTE format('CREATE POLICY admin_all ON public.%I FOR ALL USING (public.is_admin() OR public.get_user_role() = ''superadmin'')', t);
    END LOOP;
END $$;
