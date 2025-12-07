-- Create messages table for client-engineer communication
-- Run this in Supabase SQL Editor

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachment JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_messages_project_id ON messages(project_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(project_id, created_at DESC);
CREATE INDEX idx_messages_unread ON messages(sender_id, is_read) WHERE is_read = false;

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can read messages from their projects
CREATE POLICY "Users can view messages from their projects" ON messages
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
    OR
    sender_id = auth.uid()
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'engineer')
  );

-- RLS Policy: Users can send messages to projects they're involved in
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND (
      project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
      OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'engineer')
    )
  );

-- RLS Policy: Users can update their own messages or mark as read
CREATE POLICY "Users can update messages" ON messages
  FOR UPDATE USING (
    sender_id = auth.uid()
    OR
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'engineer')
  );

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
