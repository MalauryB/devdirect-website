-- Drop existing table if exists (development only)
DROP TABLE IF EXISTS quotes CASCADE;

-- Create quotes table
CREATE TABLE quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,

  -- Version du devis (auto-incrémentée par projet)
  version INTEGER NOT NULL DEFAULT 1,

  -- Étape 1: Informations générales
  name TEXT NOT NULL DEFAULT '',
  start_date DATE,
  end_date DATE,
  comment TEXT DEFAULT '',

  -- Profils assignés au devis (stockés en JSONB)
  -- Structure: [{ name: string, daily_rate: number }]
  profiles JSONB DEFAULT '[]',

  -- Étape 2: Abaques (grilles de chiffrage par composant)
  -- Structure: [{ component_name: string, profile_name: string, days_ts: number, days_s: number, days_m: number, days_c: number, days_tc: number }]
  abaques JSONB DEFAULT '[]',

  -- Étape 3: Activités transverses (par niveaux)
  -- Structure: [{ level: number, activities: [{ name: string, profile_name: string, type: 'fixed'|'rate', value: number }] }]
  transverse_levels JSONB DEFAULT '[]',

  -- Étape 4: Éléments de chiffrage (catégories > activités > composants)
  -- Structure: [{ name: string, activities: [{ name: string, active: boolean, components: [{ coefficient: number, component_name: string, complexity: string, comment: string }] }] }]
  costing_categories JSONB DEFAULT '[]',

  -- Récapitulatif et conditions
  notes TEXT DEFAULT '',
  payment_terms TEXT DEFAULT '',
  validity_days INTEGER DEFAULT 30,

  -- Montant total calculé
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,

  -- Statut du devis
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Index pour les requêtes fréquentes
CREATE INDEX quotes_project_id_idx ON quotes(project_id);
CREATE INDEX quotes_status_idx ON quotes(status);

-- Contrainte d'unicité pour version par projet
CREATE UNIQUE INDEX quotes_project_version_idx ON quotes(project_id, version);

-- Policies: Les clients peuvent voir les devis de leurs projets
CREATE POLICY "Users can view quotes for their projects" ON quotes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = quotes.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Les ingénieurs peuvent voir tous les devis
CREATE POLICY "Engineers can view all quotes" ON quotes
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'engineer'
  );

-- Les ingénieurs peuvent créer des devis
CREATE POLICY "Engineers can insert quotes" ON quotes
  FOR INSERT WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'engineer'
  );

-- Les ingénieurs peuvent modifier des devis
CREATE POLICY "Engineers can update quotes" ON quotes
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'engineer'
  );

-- Les ingénieurs peuvent supprimer des devis
CREATE POLICY "Engineers can delete quotes" ON quotes
  FOR DELETE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'engineer'
  );

-- Fonction pour auto-incrémenter la version par projet
CREATE OR REPLACE FUNCTION get_next_quote_version(p_project_id UUID)
RETURNS INTEGER AS $$
DECLARE
  next_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version), 0) + 1 INTO next_version
  FROM quotes
  WHERE project_id = p_project_id;
  RETURN next_version;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_quote_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_quote_updated_at();
