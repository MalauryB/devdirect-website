-- Fix RLS policies for contract_profiles table
-- Allow engineers to manage contract profiles (same as project_contracts)

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view contract profiles for their contracts" ON contract_profiles;
DROP POLICY IF EXISTS "Users can insert contract profiles for their contracts" ON contract_profiles;
DROP POLICY IF EXISTS "Users can update contract profiles for their contracts" ON contract_profiles;
DROP POLICY IF EXISTS "Users can delete contract profiles for their contracts" ON contract_profiles;

-- Create new policies that allow engineers to manage all contract profiles

-- Engineers can view all contract profiles
CREATE POLICY "Engineers can view all contract profiles"
  ON contract_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

-- Engineers can create contract profiles
CREATE POLICY "Engineers can create contract profiles"
  ON contract_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

-- Engineers can update contract profiles
CREATE POLICY "Engineers can update contract profiles"
  ON contract_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

-- Engineers can delete contract profiles
CREATE POLICY "Engineers can delete contract profiles"
  ON contract_profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

-- Clients can view contract profiles for their own projects
CREATE POLICY "Clients can view their contract profiles"
  ON contract_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_contracts pc
      JOIN projects p ON pc.project_id = p.id
      WHERE pc.id = contract_profiles.contract_id
      AND p.user_id = auth.uid()
    )
  );
