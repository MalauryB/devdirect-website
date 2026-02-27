-- =====================================================
-- SUPABASE RLS POLICIES - RESTORATION COMPLÈTE
-- =====================================================
-- Script basé sur les migrations réelles du projet
-- (014_fix_rls_security + 013, 020, 023, 024)
-- Exécutez ce script dans l'éditeur SQL de Supabase
-- =====================================================

-- =====================================================
-- ACTIVER RLS SUR TOUTES LES TABLES
-- =====================================================

ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS action_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS milestone_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS milestone_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS project_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contract_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS global_documents ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Engineers can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

CREATE POLICY "Authenticated users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- PROJECTS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Engineers can view all projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Engineers can update all projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
DROP POLICY IF EXISTS "Users and engineers can view projects" ON projects;
DROP POLICY IF EXISTS "Users and engineers can update projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Engineers can update projects" ON projects;

CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Engineers can view all projects"
  ON projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Engineers can update all projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- QUOTES POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Engineers can view all quotes" ON quotes;
DROP POLICY IF EXISTS "Engineers can create quotes" ON quotes;
DROP POLICY IF EXISTS "Engineers can update quotes" ON quotes;
DROP POLICY IF EXISTS "Engineers can delete quotes" ON quotes;
DROP POLICY IF EXISTS "Clients can view their project quotes" ON quotes;
DROP POLICY IF EXISTS "Users can view quotes for their projects" ON quotes;
DROP POLICY IF EXISTS "Engineers can insert quotes" ON quotes;
DROP POLICY IF EXISTS "Users can view their own quotes" ON quotes;
DROP POLICY IF EXISTS "Users can create quotes" ON quotes;

CREATE POLICY "Engineers can view all quotes"
  ON quotes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Engineers can create quotes"
  ON quotes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Engineers can update quotes"
  ON quotes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Engineers can delete quotes"
  ON quotes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Clients can view their project quotes"
  ON quotes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = quotes.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- =====================================================
-- MESSAGES POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view messages for their projects" ON messages;
DROP POLICY IF EXISTS "Engineers can view all messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their projects" ON messages;
DROP POLICY IF EXISTS "Engineers can send messages to any project" ON messages;
DROP POLICY IF EXISTS "Users can soft delete their own messages" ON messages;
DROP POLICY IF EXISTS "Users can view messages from their projects" ON messages;
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can create messages" ON messages;
DROP POLICY IF EXISTS "Engineers can create messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update messages" ON messages;

CREATE POLICY "Users can view messages for their projects"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = messages.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Engineers can view all messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Users can send messages to their projects"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = messages.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Engineers can send messages to any project"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Users can soft delete their own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

-- =====================================================
-- PROJECT_DOCUMENTS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view documents of their projects" ON project_documents;
DROP POLICY IF EXISTS "Engineers can view all documents" ON project_documents;
DROP POLICY IF EXISTS "Users can upload documents to their projects" ON project_documents;
DROP POLICY IF EXISTS "Engineers can upload documents to any project" ON project_documents;
DROP POLICY IF EXISTS "Engineers can update documents" ON project_documents;
DROP POLICY IF EXISTS "Engineers can delete documents" ON project_documents;
DROP POLICY IF EXISTS "Clients can insert their project documents" ON project_documents;
DROP POLICY IF EXISTS "Clients can update their project documents" ON project_documents;
DROP POLICY IF EXISTS "Engineers can view all project documents" ON project_documents;
DROP POLICY IF EXISTS "Engineers can insert project documents" ON project_documents;
DROP POLICY IF EXISTS "Engineers can update project documents" ON project_documents;
DROP POLICY IF EXISTS "Engineers can delete project documents" ON project_documents;
DROP POLICY IF EXISTS "Clients can view their project documents" ON project_documents;

CREATE POLICY "Users can view documents of their projects"
  ON project_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_documents.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Engineers can view all documents"
  ON project_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Users can upload documents to their projects"
  ON project_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_documents.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Engineers can upload documents to any project"
  ON project_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Engineers can update documents"
  ON project_documents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Engineers can delete documents"
  ON project_documents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Clients can insert their project documents"
  ON project_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_documents.project_id
      AND projects.user_id = auth.uid()
    )
    AND type IN ('specification', 'planning', 'mockup', 'other')
  );

CREATE POLICY "Clients can update their project documents"
  ON project_documents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_documents.project_id
      AND projects.user_id = auth.uid()
    )
    AND uploaded_by = auth.uid()
  );

-- =====================================================
-- ACTION_ASSIGNMENTS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Engineers can view all assignments" ON action_assignments;
DROP POLICY IF EXISTS "Engineers can create assignments" ON action_assignments;
DROP POLICY IF EXISTS "Engineers can update assignments" ON action_assignments;
DROP POLICY IF EXISTS "Engineers can delete assignments" ON action_assignments;

CREATE POLICY "Engineers can view all assignments"
  ON action_assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Engineers can create assignments"
  ON action_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Engineers can update assignments"
  ON action_assignments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Engineers can delete assignments"
  ON action_assignments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

-- =====================================================
-- TIME_ENTRIES POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Engineers can view all time entries" ON time_entries;
DROP POLICY IF EXISTS "Engineers can create time entries" ON time_entries;
DROP POLICY IF EXISTS "Engineers can update their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Engineers can delete their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Clients can view time entries for their projects" ON time_entries;
DROP POLICY IF EXISTS "Engineers can view time entries" ON time_entries;
DROP POLICY IF EXISTS "Engineers can insert own time entries" ON time_entries;

CREATE POLICY "Engineers can view all time entries"
  ON time_entries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Engineers can create time entries"
  ON time_entries FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Engineers can update their own time entries"
  ON time_entries FOR UPDATE
  TO authenticated
  USING (
    engineer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Engineers can delete their own time entries"
  ON time_entries FOR DELETE
  TO authenticated
  USING (
    engineer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Clients can view time entries for their projects"
  ON time_entries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = time_entries.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- =====================================================
-- PROJECT_MILESTONES POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Engineers can view all milestones" ON project_milestones;
DROP POLICY IF EXISTS "Engineers can create milestones" ON project_milestones;
DROP POLICY IF EXISTS "Engineers can update milestones" ON project_milestones;
DROP POLICY IF EXISTS "Engineers can delete milestones" ON project_milestones;
DROP POLICY IF EXISTS "Clients can view milestones for their projects" ON project_milestones;

CREATE POLICY "Engineers can view all milestones"
  ON project_milestones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Engineers can create milestones"
  ON project_milestones FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Engineers can update milestones"
  ON project_milestones FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Engineers can delete milestones"
  ON project_milestones FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Clients can view milestones for their projects"
  ON project_milestones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_milestones.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- =====================================================
-- MILESTONE_ASSIGNEES POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Engineers can view all milestone assignees" ON milestone_assignees;
DROP POLICY IF EXISTS "Engineers can manage milestone assignees" ON milestone_assignees;
DROP POLICY IF EXISTS "Clients can view assignees for their project milestones" ON milestone_assignees;

CREATE POLICY "Engineers can view all milestone assignees"
  ON milestone_assignees FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Engineers can manage milestone assignees"
  ON milestone_assignees FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Clients can view assignees for their project milestones"
  ON milestone_assignees FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_milestones pm
      JOIN projects p ON p.id = pm.project_id
      WHERE pm.id = milestone_assignees.milestone_id
      AND p.user_id = auth.uid()
    )
  );

-- =====================================================
-- MILESTONE_SUBTASKS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Engineers can view all subtasks" ON milestone_subtasks;
DROP POLICY IF EXISTS "Engineers can manage subtasks" ON milestone_subtasks;
DROP POLICY IF EXISTS "Clients can view subtasks for their project milestones" ON milestone_subtasks;
DROP POLICY IF EXISTS "Engineers can create subtasks" ON milestone_subtasks;
DROP POLICY IF EXISTS "Engineers can update subtasks" ON milestone_subtasks;
DROP POLICY IF EXISTS "Engineers can delete subtasks" ON milestone_subtasks;

CREATE POLICY "Engineers can view all subtasks"
  ON milestone_subtasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Engineers can manage subtasks"
  ON milestone_subtasks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Clients can view subtasks for their project milestones"
  ON milestone_subtasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_milestones pm
      JOIN projects p ON p.id = pm.project_id
      WHERE pm.id = milestone_subtasks.milestone_id
      AND p.user_id = auth.uid()
    )
  );

-- =====================================================
-- PROJECT_CONTRACTS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Engineers can view all contracts" ON project_contracts;
DROP POLICY IF EXISTS "Engineers can create contracts" ON project_contracts;
DROP POLICY IF EXISTS "Engineers can update contracts" ON project_contracts;
DROP POLICY IF EXISTS "Engineers can delete draft contracts" ON project_contracts;
DROP POLICY IF EXISTS "Clients can view their project contracts" ON project_contracts;
DROP POLICY IF EXISTS "Clients can sign their contracts" ON project_contracts;

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

-- =====================================================
-- CONTRACT_PROFILES POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Engineers can view all contract profiles" ON contract_profiles;
DROP POLICY IF EXISTS "Engineers can create contract profiles" ON contract_profiles;
DROP POLICY IF EXISTS "Engineers can update contract profiles" ON contract_profiles;
DROP POLICY IF EXISTS "Engineers can delete contract profiles" ON contract_profiles;
DROP POLICY IF EXISTS "Clients can view their contract profiles" ON contract_profiles;
DROP POLICY IF EXISTS "Users can view contract profiles for their contracts" ON contract_profiles;
DROP POLICY IF EXISTS "Users can insert contract profiles for their contracts" ON contract_profiles;
DROP POLICY IF EXISTS "Users can update contract profiles for their contracts" ON contract_profiles;
DROP POLICY IF EXISTS "Users can delete contract profiles for their contracts" ON contract_profiles;

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

-- =====================================================
-- GLOBAL_DOCUMENTS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Engineers can view global documents" ON global_documents;
DROP POLICY IF EXISTS "Engineers can insert global documents" ON global_documents;
DROP POLICY IF EXISTS "Engineers can update global documents" ON global_documents;
DROP POLICY IF EXISTS "Engineers can delete global documents" ON global_documents;

CREATE POLICY "Engineers can view global documents"
  ON global_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Engineers can insert global documents"
  ON global_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Engineers can update global documents"
  ON global_documents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

CREATE POLICY "Engineers can delete global documents"
  ON global_documents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'engineer'
    )
  );

-- =====================================================
-- STORAGE POLICIES (bucket: global-documents)
-- =====================================================

DROP POLICY IF EXISTS "Engineers can upload global documents" ON storage.objects;
DROP POLICY IF EXISTS "Engineers can view global documents files" ON storage.objects;
DROP POLICY IF EXISTS "Engineers can delete global documents files" ON storage.objects;

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

-- =====================================================
-- VÉRIFICATION
-- =====================================================

SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
