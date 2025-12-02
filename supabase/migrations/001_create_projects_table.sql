-- Create projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Titre du projet
  title TEXT NOT NULL DEFAULT '',

  -- Type de projet (array de strings)
  project_types TEXT[] NOT NULL DEFAULT '{}',

  -- Services demandés
  services TEXT[] NOT NULL DEFAULT '{}',

  -- Plateformes cibles
  platforms TEXT[] NOT NULL DEFAULT '{}',

  -- Description du projet
  description TEXT NOT NULL,
  features TEXT DEFAULT '',
  target_audience TEXT DEFAULT '',

  -- Projet existant
  has_existing_project BOOLEAN DEFAULT FALSE,
  existing_technologies TEXT DEFAULT '',

  -- Design
  needs_design TEXT DEFAULT '', -- 'yes' | 'partial' | 'no'

  -- Budget et délais
  budget TEXT DEFAULT '', -- 'small' | 'medium' | 'large' | 'xlarge' | 'flexible'
  deadline TEXT DEFAULT '', -- 'urgent' | 'short' | 'medium' | 'long' | 'flexible'

  -- Informations additionnelles
  additional_info TEXT DEFAULT '',

  -- Fichiers joints (stockés en JSONB)
  specifications_file JSONB,
  design_files JSONB,
  brand_assets JSONB,
  inspiration_images JSONB,
  other_documents JSONB,

  -- Statut et timestamps
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'active', 'won', 'lost', 'cancelled', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policies: users can only see and manage their own projects
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Migration: ajouter les colonnes manquantes sur une table existante
-- ALTER TABLE projects ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '';
-- ALTER TABLE projects ADD COLUMN IF NOT EXISTS specifications_file JSONB;
-- ALTER TABLE projects ADD COLUMN IF NOT EXISTS design_files JSONB;
-- ALTER TABLE projects ADD COLUMN IF NOT EXISTS brand_assets JSONB;
-- ALTER TABLE projects ADD COLUMN IF NOT EXISTS inspiration_images JSONB;
-- ALTER TABLE projects ADD COLUMN IF NOT EXISTS other_documents JSONB;

-- Migration: ajouter les informations client dénormalisées
-- ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_email TEXT DEFAULT '';
-- ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_first_name TEXT DEFAULT '';
-- ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_last_name TEXT DEFAULT '';
-- ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_company_name TEXT DEFAULT '';
-- ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_phone TEXT DEFAULT '';

-- Migration: Politiques RLS pour les ingénieurs
-- Les ingénieurs peuvent voir tous les projets
-- DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
-- CREATE POLICY "Users and engineers can view projects" ON projects
--   FOR SELECT USING (
--     auth.uid() = user_id
--     OR
--     (auth.jwt() -> 'user_metadata' ->> 'role') = 'engineer'
--   );

-- Les ingénieurs peuvent modifier tous les projets
-- DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
-- CREATE POLICY "Users and engineers can update projects" ON projects
--   FOR UPDATE USING (
--     auth.uid() = user_id
--     OR
--     (auth.jwt() -> 'user_metadata' ->> 'role') = 'engineer'
--   );

