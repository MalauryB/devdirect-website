-- Migration to fix RLS policies that use user_metadata (security issue)
-- user_metadata is editable by end users and should never be used in a security context
-- We use the profiles table instead to check user roles

-- ============================================
-- PROJECTS TABLE
-- ============================================

-- Drop existing policies that may use user_metadata
DROP POLICY IF EXISTS "Users and engineers can view projects" ON projects;
DROP POLICY IF EXISTS "Users and engineers can update projects" ON projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
DROP POLICY IF EXISTS "Engineers can view all projects" ON projects;
DROP POLICY IF EXISTS "Engineers can update all projects" ON projects;

-- Recreate policies using profiles table for role check
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

-- ============================================
-- QUOTES TABLE
-- ============================================

DROP POLICY IF EXISTS "Engineers can view all quotes" ON quotes;
DROP POLICY IF EXISTS "Engineers can create quotes" ON quotes;
DROP POLICY IF EXISTS "Engineers can update quotes" ON quotes;
DROP POLICY IF EXISTS "Engineers can delete quotes" ON quotes;
DROP POLICY IF EXISTS "Clients can view their project quotes" ON quotes;

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

-- ============================================
-- MESSAGES TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view messages for their projects" ON messages;
DROP POLICY IF EXISTS "Engineers can view all messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their projects" ON messages;
DROP POLICY IF EXISTS "Engineers can send messages to any project" ON messages;
DROP POLICY IF EXISTS "Users can soft delete their own messages" ON messages;

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

-- ============================================
-- PROJECT_DOCUMENTS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view documents of their projects" ON project_documents;
DROP POLICY IF EXISTS "Engineers can view all documents" ON project_documents;
DROP POLICY IF EXISTS "Users can upload documents to their projects" ON project_documents;
DROP POLICY IF EXISTS "Engineers can upload documents to any project" ON project_documents;
DROP POLICY IF EXISTS "Engineers can update documents" ON project_documents;
DROP POLICY IF EXISTS "Engineers can delete documents" ON project_documents;

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

-- ============================================
-- ACTION_ASSIGNMENTS TABLE
-- ============================================

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

-- ============================================
-- TIME_ENTRIES TABLE
-- ============================================

DROP POLICY IF EXISTS "Engineers can view all time entries" ON time_entries;
DROP POLICY IF EXISTS "Engineers can create time entries" ON time_entries;
DROP POLICY IF EXISTS "Engineers can update their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Engineers can delete their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Clients can view time entries for their projects" ON time_entries;

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

-- ============================================
-- PROJECT_MILESTONES TABLE
-- ============================================

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

-- ============================================
-- MILESTONE_ASSIGNEES TABLE
-- ============================================

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

-- ============================================
-- MILESTONE_SUBTASKS TABLE
-- ============================================

DROP POLICY IF EXISTS "Engineers can view all subtasks" ON milestone_subtasks;
DROP POLICY IF EXISTS "Engineers can manage subtasks" ON milestone_subtasks;
DROP POLICY IF EXISTS "Clients can view subtasks for their project milestones" ON milestone_subtasks;

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

-- ============================================
-- PROFILES TABLE (ensure engineers can view all)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Engineers can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- For profiles table, we cannot use a subquery on profiles itself (infinite recursion)
-- Solution: All authenticated users can view all profiles (needed for showing client/engineer names)
-- This is safe because profiles only contain public information (name, avatar, etc.)
CREATE POLICY "Authenticated users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
