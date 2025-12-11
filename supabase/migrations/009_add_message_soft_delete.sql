-- Add soft delete fields to messages table
-- Run this in Supabase SQL Editor

-- Add is_deleted and deleted_at columns
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries filtering out deleted messages
CREATE INDEX IF NOT EXISTS idx_messages_is_deleted ON messages(is_deleted);
