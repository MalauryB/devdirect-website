-- Time entries table for tracking time spent on projects by engineers
-- Run this in Supabase SQL Editor

-- Create time_entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  engineer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours DECIMAL(4,2) NOT NULL CHECK (hours > 0 AND hours <= 24),
  description TEXT,
  category VARCHAR(50), -- e.g., 'development', 'meeting', 'review', 'documentation', 'other'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_time_entries_project ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_engineer ON time_entries(engineer_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_engineer ON time_entries(project_id, engineer_id);

-- Enable RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Engineers can see all time entries for projects they have access to
CREATE POLICY "Engineers can view time entries" ON time_entries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'engineer'
    )
  );

-- Policy: Engineers can insert their own time entries
CREATE POLICY "Engineers can insert own time entries" ON time_entries
  FOR INSERT
  WITH CHECK (
    engineer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'engineer'
    )
  );

-- Policy: Engineers can update their own time entries
CREATE POLICY "Engineers can update own time entries" ON time_entries
  FOR UPDATE
  USING (engineer_id = auth.uid())
  WITH CHECK (engineer_id = auth.uid());

-- Policy: Engineers can delete their own time entries
CREATE POLICY "Engineers can delete own time entries" ON time_entries
  FOR DELETE
  USING (engineer_id = auth.uid());

-- Policy: Clients can view time entries for their projects
CREATE POLICY "Clients can view time entries for their projects" ON time_entries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND p.user_id = auth.uid()
    )
  );
