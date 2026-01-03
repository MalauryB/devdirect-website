-- Migration to add global_documents table for company-wide templates
-- These documents are not tied to a specific project (e.g., PPT templates, email signatures)

-- Create global document type enum
CREATE TYPE global_document_type AS ENUM (
  'template_ppt',
  'template_word',
  'template_excel',
  'email_signature',
  'branding',
  'process',
  'other'
);

-- Create global_documents table
CREATE TABLE IF NOT EXISTS global_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type global_document_type NOT NULL DEFAULT 'other',
  category VARCHAR(100), -- Optional category for organization (e.g., "Commercial", "Technique", "RH")
  file_path TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  parent_id UUID REFERENCES global_documents(id) ON DELETE SET NULL,
  is_latest BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_global_documents_type ON global_documents(type);
CREATE INDEX IF NOT EXISTS idx_global_documents_category ON global_documents(category);
CREATE INDEX IF NOT EXISTS idx_global_documents_is_latest ON global_documents(is_latest);
CREATE INDEX IF NOT EXISTS idx_global_documents_uploaded_by ON global_documents(uploaded_by);

-- Add RLS policies
ALTER TABLE global_documents ENABLE ROW LEVEL SECURITY;

-- Engineers can see all global documents
CREATE POLICY "Engineers can view global documents"
  ON global_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

-- Engineers can insert global documents
CREATE POLICY "Engineers can insert global documents"
  ON global_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

-- Engineers can update global documents
CREATE POLICY "Engineers can update global documents"
  ON global_documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

-- Engineers can delete global documents
CREATE POLICY "Engineers can delete global documents"
  ON global_documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

-- Create storage bucket for global documents if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('global-documents', 'global-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for global-documents bucket
CREATE POLICY "Engineers can upload global documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'global-documents'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Engineers can view global documents files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'global-documents'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Engineers can delete global documents files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'global-documents'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

-- Add comments for documentation
COMMENT ON TABLE global_documents IS 'Company-wide document templates and resources not tied to specific projects';
COMMENT ON COLUMN global_documents.type IS 'Type of global document: template_ppt, template_word, template_excel, email_signature, branding, process, other';
COMMENT ON COLUMN global_documents.category IS 'Optional category for organizing documents (e.g., Commercial, Technique, RH)';
