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
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'accepted', 'in_progress', 'completed', 'cancelled')),
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
