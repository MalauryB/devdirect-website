-- Create contract types enum
CREATE TYPE contract_type AS ENUM ('service_agreement', 'terms_of_sale', 'amendment');

-- Create contract status enum
CREATE TYPE contract_status AS ENUM ('draft', 'sent', 'signed', 'cancelled');

-- Create project_contracts table
CREATE TABLE project_contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,

  -- Contract info
  type contract_type NOT NULL DEFAULT 'service_agreement',
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,

  -- Status tracking
  status contract_status NOT NULL DEFAULT 'draft',

  -- Dates
  sent_at TIMESTAMP WITH TIME ZONE,
  signed_at TIMESTAMP WITH TIME ZONE,
  valid_until DATE,

  -- Signatures
  client_signature_url TEXT,
  provider_signature_url TEXT,

  -- PDF storage
  pdf_url TEXT,

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Version tracking for amendments
  version INTEGER DEFAULT 1,
  parent_contract_id UUID REFERENCES project_contracts(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX idx_project_contracts_project_id ON project_contracts(project_id);
CREATE INDEX idx_project_contracts_quote_id ON project_contracts(quote_id);
CREATE INDEX idx_project_contracts_status ON project_contracts(status);
CREATE INDEX idx_project_contracts_type ON project_contracts(type);

-- Enable RLS
ALTER TABLE project_contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for engineers (full access)
CREATE POLICY "Engineers can view all contracts"
  ON project_contracts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Engineers can create contracts"
  ON project_contracts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Engineers can update contracts"
  ON project_contracts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Engineers can delete draft contracts"
  ON project_contracts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
    AND status = 'draft'
  );

-- RLS Policies for clients (view own project contracts)
CREATE POLICY "Clients can view their project contracts"
  ON project_contracts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_contracts.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Clients can update only to add signature
CREATE POLICY "Clients can sign their contracts"
  ON project_contracts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_contracts.project_id
      AND projects.user_id = auth.uid()
    )
    AND status = 'sent'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_contracts.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Trigger to update updated_at
CREATE TRIGGER update_project_contracts_updated_at
  BEFORE UPDATE ON project_contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
