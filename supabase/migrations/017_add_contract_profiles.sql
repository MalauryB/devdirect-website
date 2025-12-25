-- Migration to add contract_profiles table for multiple TJM rates in time and materials contracts
-- Each contract can have multiple profiles (e.g., "Dev Senior" 600€/j, "Dev Junior" 400€/j)

-- Create contract_profiles table
CREATE TABLE IF NOT EXISTS contract_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES project_contracts(id) ON DELETE CASCADE,
  profile_name VARCHAR(100) NOT NULL,
  daily_rate DECIMAL(10, 2) NOT NULL,
  estimated_days INTEGER DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_contract_profiles_contract_id ON contract_profiles(contract_id);

-- Add comments for documentation
COMMENT ON TABLE contract_profiles IS 'Profiles with different daily rates for time and materials contracts';
COMMENT ON COLUMN contract_profiles.profile_name IS 'Name of the profile (e.g., Développeur Senior, Chef de projet)';
COMMENT ON COLUMN contract_profiles.daily_rate IS 'Daily rate (TJM) in EUR for this profile';
COMMENT ON COLUMN contract_profiles.estimated_days IS 'Estimated number of days for this profile (optional, indicative)';

-- Remove single daily_rate and estimated_days from project_contracts (now in profiles)
-- Note: We keep the columns for backward compatibility, they will be ignored for new contracts
-- ALTER TABLE project_contracts DROP COLUMN IF EXISTS daily_rate;
-- ALTER TABLE project_contracts DROP COLUMN IF EXISTS estimated_days;

-- Enable RLS
ALTER TABLE contract_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for contract_profiles (same access as parent contract)
CREATE POLICY "Users can view contract profiles for their contracts"
  ON contract_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_contracts pc
      JOIN projects p ON pc.project_id = p.id
      WHERE pc.id = contract_profiles.contract_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert contract profiles for their contracts"
  ON contract_profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_contracts pc
      JOIN projects p ON pc.project_id = p.id
      WHERE pc.id = contract_profiles.contract_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update contract profiles for their contracts"
  ON contract_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM project_contracts pc
      JOIN projects p ON pc.project_id = p.id
      WHERE pc.id = contract_profiles.contract_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete contract profiles for their contracts"
  ON contract_profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM project_contracts pc
      JOIN projects p ON pc.project_id = p.id
      WHERE pc.id = contract_profiles.contract_id
      AND p.user_id = auth.uid()
    )
  );
