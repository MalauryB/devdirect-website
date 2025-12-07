"use client"

import { supabase } from './supabase'
import { Message, MessageAttachment } from './types'

// Fetch messages for a project
export async function getProjectMessages(projectId: string): Promise<{ messages: Message[]; error: Error | null }> {
  const { data: messages, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:sender_id(id, first_name, last_name, avatar_url, role, company_name)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  return { messages: messages || [], error }
}

// Send a new message
export async function sendMessage(
  projectId: string,
  senderId: string,
  content: string,
  attachment?: MessageAttachment | null
): Promise<{ message: Message | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      project_id: projectId,
      sender_id: senderId,
      content,
      attachment: attachment || null,
      is_read: false
    })
    .select(`
      *,
      sender:sender_id(id, first_name, last_name, avatar_url, role, company_name)
    `)
    .single()

  return { message: data, error }
}

// Mark messages as read
export async function markMessagesAsRead(
  projectId: string,
  userId: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('messages')
    .update({
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq('project_id', projectId)
    .neq('sender_id', userId)
    .eq('is_read', false)

  return { error }
}

// Get unread message count for a project
export async function getUnreadCount(
  projectId: string,
  userId: string
): Promise<{ count: number; error: Error | null }> {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .neq('sender_id', userId)
    .eq('is_read', false)

  return { count: count || 0, error }
}

// Get unread counts for all projects (for badges)
export async function getAllUnreadCounts(
  userId: string
): Promise<{ counts: Record<string, number>; error: Error | null }> {
  const { data, error } = await supabase
    .from('messages')
    .select('project_id')
    .neq('sender_id', userId)
    .eq('is_read', false)

  const counts: Record<string, number> = {}
  if (data) {
    for (const msg of data) {
      counts[msg.project_id] = (counts[msg.project_id] || 0) + 1
    }
  }

  return { counts, error }
}

// Subscribe to new messages for a project (real-time)
export function subscribeToProjectMessages(
  projectId: string,
  callback: (message: Message) => void
) {
  const subscription = supabase
    .channel(`project:${projectId}:messages`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `project_id=eq.${projectId}`,
      },
      async (payload) => {
        // Fetch the full message with sender info
        const { data } = await supabase
          .from('messages')
          .select(`
            *,
            sender:sender_id(id, first_name, last_name, avatar_url, role, company_name)
          `)
          .eq('id', payload.new.id)
          .single()

        if (data) {
          callback(data as Message)
        }
      }
    )
    .subscribe()

  return subscription
}

// Subscribe to message updates (read status)
export function subscribeToMessageUpdates(
  projectId: string,
  callback: (message: Message) => void
) {
  const subscription = supabase
    .channel(`project:${projectId}:updates`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        callback(payload.new as Message)
      }
    )
    .subscribe()

  return subscription
}
