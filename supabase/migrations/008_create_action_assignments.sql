-- Create action_assignments table for assigning engineers to actions
-- Run this in Supabase SQL Editor

-- Create action_assignments table
CREATE TABLE action_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Action type: 'message', 'quote', 'send'
  action_type VARCHAR(20) NOT NULL,
  -- Reference to the related entity (project_id for messages/quotes, quote_id for send)
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  -- Assigned engineer
  assigned_to UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  -- Who assigned it
  assigned_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- Ensure unique assignment per action
  CONSTRAINT unique_action_assignment UNIQUE (action_type, project_id, quote_id)
);

-- Create indexes for performance
CREATE INDEX idx_action_assignments_project ON action_assignments(project_id);
CREATE INDEX idx_action_assignments_quote ON action_assignments(quote_id);
CREATE INDEX idx_action_assignments_assigned_to ON action_assignments(assigned_to);
CREATE INDEX idx_action_assignments_type ON action_assignments(action_type);

-- Enable RLS
ALTER TABLE action_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only engineers can view and manage assignments
CREATE POLICY "Engineers can view all assignments" ON action_assignments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'engineer')
  );

CREATE POLICY "Engineers can create assignments" ON action_assignments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'engineer')
    AND assigned_by = auth.uid()
  );

CREATE POLICY "Engineers can update assignments" ON action_assignments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'engineer')
  );

CREATE POLICY "Engineers can delete assignments" ON action_assignments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'engineer')
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_action_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER action_assignments_updated_at
  BEFORE UPDATE ON action_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_action_assignments_updated_at();
