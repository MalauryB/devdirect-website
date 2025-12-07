-- Fix authentication triggers that were causing "Database error granting user"
-- The issue was with JSONB casting and missing exception handlers

-- Fix handle_user_update
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.profiles
  SET
    email = NEW.email,
    first_name = COALESCE(NEW.raw_user_meta_data->>'first_name', first_name),
    last_name = COALESCE(NEW.raw_user_meta_data->>'last_name', last_name),
    company_name = COALESCE(NEW.raw_user_meta_data->>'company_name', company_name),
    phone = COALESCE(NEW.raw_user_meta_data->>'phone', phone),
    client_type = COALESCE(NEW.raw_user_meta_data->>'client_type', client_type),
    siret = COALESCE(NEW.raw_user_meta_data->>'siret', siret),
    role = COALESCE(NEW.raw_user_meta_data->>'role', role),
    job_title = COALESCE(NEW.raw_user_meta_data->>'job_title', job_title),
    bio = COALESCE(NEW.raw_user_meta_data->>'bio', bio),
    skills = CASE
      WHEN NEW.raw_user_meta_data->'skills' IS NOT NULL
      THEN NEW.raw_user_meta_data->'skills'
      ELSE skills
    END,
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block authentication on trigger errors
  RETURN NEW;
END;
$function$;

-- Fix handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    company_name,
    phone,
    client_type,
    siret,
    role,
    job_title,
    bio,
    skills
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'client_type', 'individual'),
    COALESCE(NEW.raw_user_meta_data->>'siret', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    COALESCE(NEW.raw_user_meta_data->>'job_title', ''),
    COALESCE(NEW.raw_user_meta_data->>'bio', ''),
    COALESCE(NEW.raw_user_meta_data->'skills', '[]'::jsonb)
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block authentication on trigger errors
  RETURN NEW;
END;
$function$;

-- Fix sync_avatar_to_profiles
CREATE OR REPLACE FUNCTION public.sync_avatar_to_profiles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.raw_user_meta_data->>'avatar_url' IS NOT NULL THEN
    UPDATE profiles
    SET avatar_url = NEW.raw_user_meta_data->>'avatar_url'
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block authentication on trigger errors
  RETURN NEW;
END;
$function$;
