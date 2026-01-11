-- Allow clients to upload documents to their projects
-- Fix: Add INSERT policy for clients and update type constraint to include 'planning'

-- First, update the type constraint to include 'planning'
ALTER TABLE project_documents DROP CONSTRAINT IF EXISTS project_documents_type_check;
ALTER TABLE project_documents ADD CONSTRAINT project_documents_type_check
  CHECK (type IN (
    'signed_quote',
    'contract',
    'invoice',
    'kickoff',
    'steering_committee',
    'documentation',
    'specification',
    'planning',
    'mockup',
    'deliverable',
    'other'
  ));

-- Add INSERT policy for clients (limited to certain document types)
DROP POLICY IF EXISTS "Clients can insert their project documents" ON project_documents;
CREATE POLICY "Clients can insert their project documents"
  ON project_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Client must own the project
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_documents.project_id
      AND projects.user_id = auth.uid()
    )
    -- Clients can only upload certain document types
    AND type IN ('specification', 'planning', 'mockup', 'other')
  );

-- Add UPDATE policy for clients (for their own documents)
DROP POLICY IF EXISTS "Clients can update their project documents" ON project_documents;
CREATE POLICY "Clients can update their project documents"
  ON project_documents FOR UPDATE
  TO authenticated
  USING (
    -- Client must own the project
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_documents.project_id
      AND projects.user_id = auth.uid()
    )
    -- Can only update documents they uploaded
    AND uploaded_by = auth.uid()
  );

-- Storage bucket policies for project-documents
-- Note: These need to be applied via Supabase Dashboard or supabase CLI
-- The bucket should already exist, we just need to update the policies

-- Storage policy: Engineers can upload to any project folder
-- (Execute in Supabase Dashboard > Storage > Policies)
/*
CREATE POLICY "Engineers can upload project documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-documents'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'engineer'
  )
);

CREATE POLICY "Clients can upload to their project folders"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-documents'
  AND EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id::text = (storage.foldername(name))[1]
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can read project documents they have access to"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-documents'
  AND (
    -- Engineers can read all
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
    OR
    -- Clients can read from their project folders
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id::text = (storage.foldername(name))[1]
      AND projects.user_id = auth.uid()
    )
  )
);
*/
