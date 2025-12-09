-- Table pour les documents de projet
CREATE TABLE IF NOT EXISTS project_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN (
    'signed_quote',
    'contract',
    'invoice',
    'kickoff',
    'steering_committee',
    'documentation',
    'specification',
    'mockup',
    'deliverable',
    'other'
  )),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  -- Versioning
  version INTEGER NOT NULL DEFAULT 1,
  parent_id UUID REFERENCES project_documents(id) ON DELETE SET NULL,
  is_latest BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_project_documents_project_id ON project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_type ON project_documents(type);
CREATE INDEX IF NOT EXISTS idx_project_documents_created_at ON project_documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_documents_parent_id ON project_documents(parent_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_is_latest ON project_documents(is_latest) WHERE is_latest = true;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_project_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_documents_updated_at
  BEFORE UPDATE ON project_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_project_documents_updated_at();

-- RLS Policies
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;

-- Les ingénieurs peuvent tout voir et modifier
CREATE POLICY "Engineers can view all project documents"
  ON project_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Engineers can insert project documents"
  ON project_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Engineers can update project documents"
  ON project_documents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Engineers can delete project documents"
  ON project_documents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

-- Les clients peuvent voir les documents de leurs propres projets
CREATE POLICY "Clients can view their project documents"
  ON project_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_documents.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Créer le bucket pour les documents de projet (à exécuter dans Supabase Storage)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('project-documents', 'project-documents', false);

-- Policies pour le bucket storage (à configurer dans Supabase Dashboard)
-- Les ingénieurs peuvent tout faire
-- Les clients peuvent télécharger les documents de leurs projets
