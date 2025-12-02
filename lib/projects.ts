"use client"

import { supabase } from './supabase'
import { Project, ProjectFormData } from './types'

export async function createProject(data: ProjectFormData): Promise<{ project: Project | null; error: Error | null }> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { project: null, error: new Error('User not authenticated') }
  }

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      ...data,
      user_id: user.id,
      status: 'pending'
    })
    .select()
    .single()

  return { project, error }
}

export async function getUserProjects(): Promise<{ projects: Project[]; error: Error | null }> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { projects: [], error: new Error('User not authenticated') }
  }

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return { projects: projects || [], error }
}

export async function getProject(id: string): Promise<{ project: Project | null; error: Error | null }> {
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  return { project, error }
}

export async function updateProject(id: string, data: Partial<ProjectFormData>): Promise<{ project: Project | null; error: Error | null }> {
  const { data: project, error } = await supabase
    .from('projects')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  return { project, error }
}

export async function deleteProject(id: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  return { error }
}

// Get all projects (for engineers only - requires RLS policy)
export async function getAllProjects(statusFilter?: string): Promise<{ projects: Project[]; error: Error | null }> {
  let query = supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data: projects, error } = await query

  return { projects: projects || [], error }
}

// Get all unique clients (for engineers only - requires RLS policy)
export async function getAllClients(): Promise<{ clients: { user_id: string; email: string; first_name?: string; last_name?: string; project_count: number }[]; error: Error | null }> {
  const { data: projects, error } = await supabase
    .from('projects')
    .select('user_id')

  if (error) {
    return { clients: [], error }
  }

  // Get unique user IDs with project counts
  const userCounts = (projects || []).reduce((acc, project) => {
    acc[project.user_id] = (acc[project.user_id] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // For now, return user IDs with project counts
  // In a real app, you'd join with a profiles table
  const clients = Object.entries(userCounts).map(([user_id, project_count]) => ({
    user_id,
    email: '', // Will be populated from user metadata if available
    project_count
  }))

  return { clients, error: null }
}
