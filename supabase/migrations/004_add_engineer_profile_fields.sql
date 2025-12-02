-- Add engineer-specific fields to profiles table
-- These fields are used for Memory team members (engineers)

-- Job title / Position (ex: "Développeur Senior", "Chef de projet", "Designer UI/UX")
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS job_title TEXT DEFAULT '';

-- Short bio / Description
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';

-- Skills (stored as JSONB array of strings)
-- Example: ["React", "Node.js", "TypeScript", "PostgreSQL"]
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]';

-- Update the handle_new_user function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
    COALESCE((NEW.raw_user_meta_data->>'skills')::jsonb, '[]'::jsonb)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_user_update function to sync new fields
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
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
    skills = COALESCE((NEW.raw_user_meta_data->>'skills')::jsonb, skills),
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
