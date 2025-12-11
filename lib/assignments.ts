"use client"

import { supabase } from './supabase'
import { Profile } from './types'

export type ActionType = 'message' | 'quote' | 'send'

export interface ActionAssignment {
  id: string
  action_type: ActionType
  project_id: string | null
  quote_id: string | null
  assigned_to: string
  assigned_by: string
  created_at: string
  updated_at: string
  // Joined data
  assignee?: Profile
  assigner?: Profile
}

// Get all assignments
export async function getAllAssignments(): Promise<{ assignments: ActionAssignment[]; error: Error | null }> {
  const { data, error } = await supabase
    .from('action_assignments')
    .select(`
      *,
      assignee:assigned_to(id, first_name, last_name, avatar_url, role),
      assigner:assigned_by(id, first_name, last_name, avatar_url, role)
    `)
    .order('created_at', { ascending: false })

  return { assignments: data || [], error }
}

// Get assignment for a specific action
export async function getAssignment(
  actionType: ActionType,
  projectId: string | null,
  quoteId: string | null
): Promise<{ assignment: ActionAssignment | null; error: Error | null }> {
  let query = supabase
    .from('action_assignments')
    .select(`
      *,
      assignee:assigned_to(id, first_name, last_name, avatar_url, role),
      assigner:assigned_by(id, first_name, last_name, avatar_url, role)
    `)
    .eq('action_type', actionType)

  if (projectId) {
    query = query.eq('project_id', projectId)
  }
  if (quoteId) {
    query = query.eq('quote_id', quoteId)
  }

  const { data, error } = await query.maybeSingle()

  return { assignment: data, error }
}

// Assign an engineer to an action
export async function assignAction(
  actionType: ActionType,
  assignedTo: string,
  assignedBy: string,
  projectId?: string,
  quoteId?: string
): Promise<{ assignment: ActionAssignment | null; error: Error | null }> {
  // First, try to update existing assignment
  const { assignment: existing } = await getAssignment(
    actionType,
    projectId || null,
    quoteId || null
  )

  if (existing) {
    // Update existing assignment
    const { data, error } = await supabase
      .from('action_assignments')
      .update({ assigned_to: assignedTo })
      .eq('id', existing.id)
      .select(`
        *,
        assignee:assigned_to(id, first_name, last_name, avatar_url, role),
        assigner:assigned_by(id, first_name, last_name, avatar_url, role)
      `)
      .single()

    return { assignment: data, error }
  }

  // Create new assignment
  const { data, error } = await supabase
    .from('action_assignments')
    .insert({
      action_type: actionType,
      project_id: projectId || null,
      quote_id: quoteId || null,
      assigned_to: assignedTo,
      assigned_by: assignedBy
    })
    .select(`
      *,
      assignee:assigned_to(id, first_name, last_name, avatar_url, role),
      assigner:assigned_by(id, first_name, last_name, avatar_url, role)
    `)
    .single()

  return { assignment: data, error }
}

// Remove assignment from an action
export async function unassignAction(
  actionType: ActionType,
  projectId?: string,
  quoteId?: string
): Promise<{ error: Error | null }> {
  let query = supabase
    .from('action_assignments')
    .delete()
    .eq('action_type', actionType)

  if (projectId) {
    query = query.eq('project_id', projectId)
  }
  if (quoteId) {
    query = query.eq('quote_id', quoteId)
  }

  const { error } = await query

  return { error }
}

// Get all engineers for assignment dropdown
export async function getEngineers(): Promise<{ engineers: Partial<Profile>[]; error: Error | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, avatar_url, role, email')
    .eq('role', 'engineer')
    .order('first_name', { ascending: true })

  return { engineers: data || [], error }
}
