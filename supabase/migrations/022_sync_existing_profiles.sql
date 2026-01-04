-- Sync existing user_metadata to profiles table
-- This ensures all profile fields are up to date with auth.users metadata

-- First, ensure the columns exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS legal_form TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS professional_email TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS contact_position TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS vat_number TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS postal_code TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS city TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'France';

-- Sync all existing users' metadata to profiles
UPDATE public.profiles p
SET
  first_name = COALESCE(u.raw_user_meta_data->>'first_name', p.first_name, ''),
  last_name = COALESCE(u.raw_user_meta_data->>'last_name', p.last_name, ''),
  company_name = COALESCE(u.raw_user_meta_data->>'company_name', p.company_name, ''),
  legal_form = COALESCE(u.raw_user_meta_data->>'legal_form', p.legal_form, ''),
  professional_email = COALESCE(u.raw_user_meta_data->>'professional_email', p.professional_email, ''),
  contact_position = COALESCE(u.raw_user_meta_data->>'contact_position', p.contact_position, ''),
  phone = COALESCE(u.raw_user_meta_data->>'phone', p.phone, ''),
  client_type = COALESCE(u.raw_user_meta_data->>'client_type', p.client_type, 'individual'),
  siret = COALESCE(u.raw_user_meta_data->>'siret', p.siret, ''),
  vat_number = COALESCE(u.raw_user_meta_data->>'vat_number', p.vat_number, ''),
  address = COALESCE(u.raw_user_meta_data->>'address', p.address, ''),
  postal_code = COALESCE(u.raw_user_meta_data->>'postal_code', p.postal_code, ''),
  city = COALESCE(u.raw_user_meta_data->>'city', p.city, ''),
  country = COALESCE(u.raw_user_meta_data->>'country', p.country, 'France'),
  avatar_url = COALESCE(u.raw_user_meta_data->>'avatar_url', p.avatar_url, ''),
  updated_at = NOW()
FROM auth.users u
WHERE p.id = u.id;
