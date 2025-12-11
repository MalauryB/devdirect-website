"use client"

import { supabase } from './supabase'
import { TimeEntry, TimeEntryCategory } from './types'

// Fetch all time entries for a project
export async function getProjectTimeEntries(projectId: string): Promise<{ entries: TimeEntry[]; error: Error | null }> {
  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      engineer:engineer_id(id, first_name, last_name, avatar_url, role)
    `)
    .eq('project_id', projectId)
    .order('date', { ascending: false })

  return { entries: data || [], error }
}

// Fetch time entries for a specific engineer on a project
export async function getEngineerTimeEntries(
  projectId: string,
  engineerId: string
): Promise<{ entries: TimeEntry[]; error: Error | null }> {
  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      engineer:engineer_id(id, first_name, last_name, avatar_url, role)
    `)
    .eq('project_id', projectId)
    .eq('engineer_id', engineerId)
    .order('date', { ascending: false })

  return { entries: data || [], error }
}

// Create a new time entry
export async function createTimeEntry(
  projectId: string,
  engineerId: string,
  date: string,
  hours: number,
  description?: string,
  category?: TimeEntryCategory
): Promise<{ entry: TimeEntry | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      project_id: projectId,
      engineer_id: engineerId,
      date,
      hours,
      description: description || null,
      category: category || null
    })
    .select(`
      *,
      engineer:engineer_id(id, first_name, last_name, avatar_url, role)
    `)
    .single()

  return { entry: data, error }
}

// Update a time entry
export async function updateTimeEntry(
  entryId: string,
  updates: {
    date?: string
    hours?: number
    description?: string
    category?: TimeEntryCategory | null
  }
): Promise<{ entry: TimeEntry | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('time_entries')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', entryId)
    .select(`
      *,
      engineer:engineer_id(id, first_name, last_name, avatar_url, role)
    `)
    .single()

  return { entry: data, error }
}

// Delete a time entry
export async function deleteTimeEntry(entryId: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('time_entries')
    .delete()
    .eq('id', entryId)

  return { error }
}

// Get aggregated time stats for a project
export async function getProjectTimeStats(projectId: string): Promise<{
  totalHours: number
  totalDays: number
  byEngineer: { engineerId: string; engineerName: string; hours: number; days: number }[]
  byCategory: { category: string; hours: number; days: number }[]
  byMonth: { month: string; hours: number; days: number }[]
  error: Error | null
}> {
  const { data: entries, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      engineer:engineer_id(id, first_name, last_name)
    `)
    .eq('project_id', projectId)

  if (error || !entries) {
    return {
      totalHours: 0,
      totalDays: 0,
      byEngineer: [],
      byCategory: [],
      byMonth: [],
      error
    }
  }

  // Calculate totals
  const totalHours = entries.reduce((sum, e) => sum + Number(e.hours), 0)
  const totalDays = totalHours / 8 // Assuming 8-hour workday

  // Group by engineer
  const engineerMap = new Map<string, { name: string; hours: number }>()
  for (const entry of entries) {
    const engineerId = entry.engineer_id
    const engineerName = entry.engineer
      ? `${entry.engineer.first_name || ''} ${entry.engineer.last_name || ''}`.trim() || 'Inconnu'
      : 'Inconnu'

    const existing = engineerMap.get(engineerId)
    if (existing) {
      existing.hours += Number(entry.hours)
    } else {
      engineerMap.set(engineerId, { name: engineerName, hours: Number(entry.hours) })
    }
  }
  const byEngineer = Array.from(engineerMap.entries()).map(([engineerId, data]) => ({
    engineerId,
    engineerName: data.name,
    hours: data.hours,
    days: data.hours / 8
  }))

  // Group by category
  const categoryMap = new Map<string, number>()
  for (const entry of entries) {
    const category = entry.category || 'other'
    categoryMap.set(category, (categoryMap.get(category) || 0) + Number(entry.hours))
  }
  const byCategory = Array.from(categoryMap.entries()).map(([category, hours]) => ({
    category,
    hours,
    days: hours / 8
  }))

  // Group by month
  const monthMap = new Map<string, number>()
  for (const entry of entries) {
    const month = entry.date.substring(0, 7) // YYYY-MM
    monthMap.set(month, (monthMap.get(month) || 0) + Number(entry.hours))
  }
  const byMonth = Array.from(monthMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, hours]) => ({
      month,
      hours,
      days: hours / 8
    }))

  return {
    totalHours,
    totalDays,
    byEngineer,
    byCategory,
    byMonth,
    error: null
  }
}
