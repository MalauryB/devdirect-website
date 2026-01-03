-- Add new company fields to profiles table for client companies
-- These fields store additional company information

-- Add new columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS legal_form TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS professional_email TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS contact_position TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS vat_number TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS postal_code TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS city TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'France';

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
    legal_form,
    professional_email,
    contact_position,
    phone,
    client_type,
    siret,
    vat_number,
    address,
    postal_code,
    city,
    country,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'legal_form', ''),
    COALESCE(NEW.raw_user_meta_data->>'professional_email', ''),
    COALESCE(NEW.raw_user_meta_data->>'contact_position', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'client_type', 'individual'),
    COALESCE(NEW.raw_user_meta_data->>'siret', ''),
    COALESCE(NEW.raw_user_meta_data->>'vat_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    COALESCE(NEW.raw_user_meta_data->>'postal_code', ''),
    COALESCE(NEW.raw_user_meta_data->>'city', ''),
    COALESCE(NEW.raw_user_meta_data->>'country', 'France'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
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
    legal_form = COALESCE(NEW.raw_user_meta_data->>'legal_form', legal_form),
    professional_email = COALESCE(NEW.raw_user_meta_data->>'professional_email', professional_email),
    contact_position = COALESCE(NEW.raw_user_meta_data->>'contact_position', contact_position),
    phone = COALESCE(NEW.raw_user_meta_data->>'phone', phone),
    client_type = COALESCE(NEW.raw_user_meta_data->>'client_type', client_type),
    siret = COALESCE(NEW.raw_user_meta_data->>'siret', siret),
    vat_number = COALESCE(NEW.raw_user_meta_data->>'vat_number', vat_number),
    address = COALESCE(NEW.raw_user_meta_data->>'address', address),
    postal_code = COALESCE(NEW.raw_user_meta_data->>'postal_code', postal_code),
    city = COALESCE(NEW.raw_user_meta_data->>'city', city),
    country = COALESCE(NEW.raw_user_meta_data->>'country', country),
    role = COALESCE(NEW.raw_user_meta_data->>'role', role),
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON COLUMN profiles.legal_form IS 'Forme juridique de l''entreprise (SAS, SARL, SA, etc.)';
COMMENT ON COLUMN profiles.professional_email IS 'Email professionnel de l''entreprise';
COMMENT ON COLUMN profiles.contact_position IS 'Poste du contact dans l''entreprise';
COMMENT ON COLUMN profiles.vat_number IS 'Numéro de TVA intracommunautaire';
COMMENT ON COLUMN profiles.address IS 'Adresse de facturation';
COMMENT ON COLUMN profiles.postal_code IS 'Code postal';
COMMENT ON COLUMN profiles.city IS 'Ville';
COMMENT ON COLUMN profiles.country IS 'Pays';
