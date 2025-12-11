"use client"

import { supabase } from './supabase'
import { ProjectMilestone, MilestoneStatus, MilestoneAssignee, MilestoneSubtask } from './types'

// Fetch all milestones for a project with assignees and subtasks
export async function getProjectMilestones(projectId: string): Promise<{ milestones: ProjectMilestone[]; error: Error | null }> {
  const { data, error } = await supabase
    .from('project_milestones')
    .select(`
      *,
      completer:completed_by(id, first_name, last_name, avatar_url),
      creator:created_by(id, first_name, last_name, avatar_url),
      assignees:milestone_assignees(
        id,
        milestone_id,
        engineer_id,
        assigned_at,
        assigned_by,
        engineer:engineer_id(id, first_name, last_name, avatar_url)
      ),
      subtasks:milestone_subtasks(
        id,
        milestone_id,
        title,
        description,
        is_completed,
        completed_at,
        completed_by,
        order_index,
        created_by,
        created_at,
        updated_at,
        completer:completed_by(id, first_name, last_name, avatar_url)
      )
    `)
    .eq('project_id', projectId)
    .order('order_index', { ascending: true })

  // Sort subtasks by order_index
  const milestones = (data || []).map(m => ({
    ...m,
    subtasks: m.subtasks?.sort((a: MilestoneSubtask, b: MilestoneSubtask) => a.order_index - b.order_index) || []
  }))

  return { milestones, error }
}

// Create a new milestone
export async function createMilestone(
  projectId: string,
  title: string,
  description?: string,
  dueDate?: string,
  orderIndex?: number,
  createdBy?: string
): Promise<{ milestone: ProjectMilestone | null; error: Error | null }> {
  // If no order index provided, get the max and add 1
  let finalOrderIndex = orderIndex
  if (finalOrderIndex === undefined) {
    const { data: existing } = await supabase
      .from('project_milestones')
      .select('order_index')
      .eq('project_id', projectId)
      .order('order_index', { ascending: false })
      .limit(1)

    finalOrderIndex = existing && existing.length > 0 ? existing[0].order_index + 1 : 0
  }

  const { data, error } = await supabase
    .from('project_milestones')
    .insert({
      project_id: projectId,
      title,
      description: description || null,
      due_date: dueDate || null,
      order_index: finalOrderIndex,
      created_by: createdBy || null,
      status: 'pending'
    })
    .select(`
      *,
      completer:completed_by(id, first_name, last_name, avatar_url),
      creator:created_by(id, first_name, last_name, avatar_url)
    `)
    .single()

  return { milestone: data, error }
}

// Update a milestone
export async function updateMilestone(
  milestoneId: string,
  updates: {
    title?: string
    description?: string
    status?: MilestoneStatus
    due_date?: string | null
    order_index?: number
  }
): Promise<{ milestone: ProjectMilestone | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('project_milestones')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', milestoneId)
    .select(`
      *,
      completer:completed_by(id, first_name, last_name, avatar_url),
      creator:created_by(id, first_name, last_name, avatar_url)
    `)
    .single()

  return { milestone: data, error }
}

// Complete a milestone
export async function completeMilestone(
  milestoneId: string,
  completedBy: string
): Promise<{ milestone: ProjectMilestone | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('project_milestones')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      completed_by: completedBy,
      updated_at: new Date().toISOString()
    })
    .eq('id', milestoneId)
    .select(`
      *,
      completer:completed_by(id, first_name, last_name, avatar_url),
      creator:created_by(id, first_name, last_name, avatar_url)
    `)
    .single()

  return { milestone: data, error }
}

// Uncomplete a milestone (revert to pending or in_progress)
export async function uncompleteMilestone(
  milestoneId: string,
  newStatus: 'pending' | 'in_progress' = 'pending'
): Promise<{ milestone: ProjectMilestone | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('project_milestones')
    .update({
      status: newStatus,
      completed_at: null,
      completed_by: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', milestoneId)
    .select(`
      *,
      completer:completed_by(id, first_name, last_name, avatar_url),
      creator:created_by(id, first_name, last_name, avatar_url)
    `)
    .single()

  return { milestone: data, error }
}

// Delete a milestone
export async function deleteMilestone(milestoneId: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('project_milestones')
    .delete()
    .eq('id', milestoneId)

  return { error }
}

// Reorder milestones
export async function reorderMilestones(
  projectId: string,
  milestoneIds: string[]
): Promise<{ error: Error | null }> {
  // Update each milestone with its new order index
  const updates = milestoneIds.map((id, index) =>
    supabase
      .from('project_milestones')
      .update({ order_index: index, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('project_id', projectId)
  )

  const results = await Promise.all(updates)
  const error = results.find(r => r.error)?.error || null

  return { error }
}

// Create multiple milestones at once (for AI generation)
export async function createMilestones(
  projectId: string,
  milestones: { title: string; description?: string; due_date?: string }[],
  createdBy?: string
): Promise<{ milestones: ProjectMilestone[]; error: Error | null }> {
  const milestonesToInsert = milestones.map((m, index) => ({
    project_id: projectId,
    title: m.title,
    description: m.description || null,
    due_date: m.due_date || null,
    order_index: index,
    created_by: createdBy || null,
    status: 'pending' as const
  }))

  const { data, error } = await supabase
    .from('project_milestones')
    .insert(milestonesToInsert)
    .select(`
      *,
      completer:completed_by(id, first_name, last_name, avatar_url),
      creator:created_by(id, first_name, last_name, avatar_url)
    `)

  return { milestones: data || [], error }
}

// Delete all milestones for a project (useful before regenerating)
export async function deleteAllMilestones(projectId: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('project_milestones')
    .delete()
    .eq('project_id', projectId)

  return { error }
}

// Get milestone statistics for a project
export async function getMilestoneStats(projectId: string): Promise<{
  total: number
  completed: number
  inProgress: number
  pending: number
  blocked: number
  progress: number
  error: Error | null
}> {
  const { data, error } = await supabase
    .from('project_milestones')
    .select('status')
    .eq('project_id', projectId)

  if (error || !data) {
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      pending: 0,
      blocked: 0,
      progress: 0,
      error
    }
  }

  const total = data.length
  const completed = data.filter(m => m.status === 'completed').length
  const inProgress = data.filter(m => m.status === 'in_progress').length
  const pending = data.filter(m => m.status === 'pending').length
  const blocked = data.filter(m => m.status === 'blocked').length
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  return {
    total,
    completed,
    inProgress,
    pending,
    blocked,
    progress,
    error: null
  }
}

// ========== ASSIGNEES ==========

// Assign an engineer to a milestone
export async function assignEngineerToMilestone(
  milestoneId: string,
  engineerId: string,
  assignedBy?: string
): Promise<{ assignee: MilestoneAssignee | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('milestone_assignees')
    .insert({
      milestone_id: milestoneId,
      engineer_id: engineerId,
      assigned_by: assignedBy || null
    })
    .select(`
      *,
      engineer:engineer_id(id, first_name, last_name, avatar_url)
    `)
    .single()

  return { assignee: data, error }
}

// Unassign an engineer from a milestone
export async function unassignEngineerFromMilestone(
  milestoneId: string,
  engineerId: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('milestone_assignees')
    .delete()
    .eq('milestone_id', milestoneId)
    .eq('engineer_id', engineerId)

  return { error }
}

// Get all assignees for a milestone
export async function getMilestoneAssignees(milestoneId: string): Promise<{ assignees: MilestoneAssignee[]; error: Error | null }> {
  const { data, error } = await supabase
    .from('milestone_assignees')
    .select(`
      *,
      engineer:engineer_id(id, first_name, last_name, avatar_url)
    `)
    .eq('milestone_id', milestoneId)

  return { assignees: data || [], error }
}

// ========== SUBTASKS ==========

// Create a subtask
export async function createSubtask(
  milestoneId: string,
  title: string,
  description?: string,
  createdBy?: string
): Promise<{ subtask: MilestoneSubtask | null; error: Error | null }> {
  // Get max order_index
  const { data: existing } = await supabase
    .from('milestone_subtasks')
    .select('order_index')
    .eq('milestone_id', milestoneId)
    .order('order_index', { ascending: false })
    .limit(1)

  const orderIndex = existing && existing.length > 0 ? existing[0].order_index + 1 : 0

  const { data, error } = await supabase
    .from('milestone_subtasks')
    .insert({
      milestone_id: milestoneId,
      title,
      description: description || null,
      order_index: orderIndex,
      created_by: createdBy || null
    })
    .select(`
      *,
      completer:completed_by(id, first_name, last_name, avatar_url)
    `)
    .single()

  return { subtask: data, error }
}

// Update a subtask
export async function updateSubtask(
  subtaskId: string,
  updates: {
    title?: string
    description?: string
    is_completed?: boolean
  }
): Promise<{ subtask: MilestoneSubtask | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('milestone_subtasks')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', subtaskId)
    .select(`
      *,
      completer:completed_by(id, first_name, last_name, avatar_url)
    `)
    .single()

  return { subtask: data, error }
}

// Toggle subtask completion
export async function toggleSubtaskCompletion(
  subtaskId: string,
  completedBy?: string
): Promise<{ subtask: MilestoneSubtask | null; error: Error | null }> {
  // First get current state
  const { data: current } = await supabase
    .from('milestone_subtasks')
    .select('is_completed')
    .eq('id', subtaskId)
    .single()

  const isCompleted = !current?.is_completed

  const { data, error } = await supabase
    .from('milestone_subtasks')
    .update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      completed_by: isCompleted ? completedBy || null : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', subtaskId)
    .select(`
      *,
      completer:completed_by(id, first_name, last_name, avatar_url)
    `)
    .single()

  return { subtask: data, error }
}

// Delete a subtask
export async function deleteSubtask(subtaskId: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('milestone_subtasks')
    .delete()
    .eq('id', subtaskId)

  return { error }
}

// Create multiple subtasks at once (for AI generation)
export async function createSubtasks(
  milestoneId: string,
  subtasks: { title: string; description?: string }[],
  createdBy?: string
): Promise<{ subtasks: MilestoneSubtask[]; error: Error | null }> {
  const subtasksToInsert = subtasks.map((s, index) => ({
    milestone_id: milestoneId,
    title: s.title,
    description: s.description || null,
    order_index: index,
    created_by: createdBy || null
  }))

  const { data, error } = await supabase
    .from('milestone_subtasks')
    .insert(subtasksToInsert)
    .select(`
      *,
      completer:completed_by(id, first_name, last_name, avatar_url)
    `)

  return { subtasks: data || [], error }
}

// Delete all subtasks for a milestone
export async function deleteAllSubtasks(milestoneId: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('milestone_subtasks')
    .delete()
    .eq('milestone_id', milestoneId)

  return { error }
}
