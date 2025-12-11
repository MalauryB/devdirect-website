-- Add assignees and subtasks to milestones
-- Run this in Supabase SQL Editor AFTER 011_add_project_milestones.sql

-- Table for milestone assignees (many-to-many relationship)
CREATE TABLE IF NOT EXISTS milestone_assignees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES project_milestones(id) ON DELETE CASCADE,
  engineer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES profiles(id),
  UNIQUE(milestone_id, engineer_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_milestone_assignees_milestone ON milestone_assignees(milestone_id);
CREATE INDEX IF NOT EXISTS idx_milestone_assignees_engineer ON milestone_assignees(engineer_id);

-- Enable RLS
ALTER TABLE milestone_assignees ENABLE ROW LEVEL SECURITY;

-- Policies for milestone_assignees
CREATE POLICY "Engineers can view all milestone assignees" ON milestone_assignees
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'engineer'
    )
  );

CREATE POLICY "Engineers can manage milestone assignees" ON milestone_assignees
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'engineer'
    )
  );

CREATE POLICY "Clients can view assignees for their project milestones" ON milestone_assignees
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_milestones pm
      JOIN projects p ON p.id = pm.project_id
      WHERE pm.id = milestone_id AND p.user_id = auth.uid()
    )
  );

-- Table for milestone subtasks
CREATE TABLE IF NOT EXISTS milestone_subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES project_milestones(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES profiles(id),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subtasks_milestone ON milestone_subtasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_order ON milestone_subtasks(milestone_id, order_index);

-- Enable RLS
ALTER TABLE milestone_subtasks ENABLE ROW LEVEL SECURITY;

-- Policies for milestone_subtasks
CREATE POLICY "Engineers can view all subtasks" ON milestone_subtasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'engineer'
    )
  );

CREATE POLICY "Engineers can create subtasks" ON milestone_subtasks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'engineer'
    )
  );

CREATE POLICY "Engineers can update subtasks" ON milestone_subtasks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'engineer'
    )
  );

CREATE POLICY "Engineers can delete subtasks" ON milestone_subtasks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'engineer'
    )
  );

CREATE POLICY "Clients can view subtasks for their project milestones" ON milestone_subtasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_milestones pm
      JOIN projects p ON p.id = pm.project_id
      WHERE pm.id = milestone_id AND p.user_id = auth.uid()
    )
  );
