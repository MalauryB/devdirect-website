-- Create profiles table (synced with auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  first_name TEXT DEFAULT '',
  last_name TEXT DEFAULT '',
  company_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  client_type TEXT DEFAULT 'individual',
  siret TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  role TEXT DEFAULT 'client',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies: users can view and update their own profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Engineers can view all profiles
CREATE POLICY "Engineers can view all profiles" ON profiles
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'engineer'
  );

-- Function to handle new user creation
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
    role
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
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to sync profile when user metadata is updated
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
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync profile on user update
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Migration: Create profiles for existing users
-- INSERT INTO profiles (id, email, first_name, last_name, company_name, phone, client_type, siret, role)
-- SELECT
--   id,
--   email,
--   COALESCE(raw_user_meta_data->>'first_name', ''),
--   COALESCE(raw_user_meta_data->>'last_name', ''),
--   COALESCE(raw_user_meta_data->>'company_name', ''),
--   COALESCE(raw_user_meta_data->>'phone', ''),
--   COALESCE(raw_user_meta_data->>'client_type', 'individual'),
--   COALESCE(raw_user_meta_data->>'siret', ''),
--   COALESCE(raw_user_meta_data->>'role', 'client')
-- FROM auth.users
-- ON CONFLICT (id) DO NOTHING;

-- Add foreign key constraint to projects table for Supabase join support
-- This allows queries like: .select('*, profiles(*)')
ALTER TABLE projects
ADD CONSTRAINT projects_user_id_profiles_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id);
