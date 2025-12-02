"use client"

import { supabase } from './supabase'
import { Quote, QuoteFormData, QuoteLineItem } from './types'

// Calculate total amount from line items
function calculateAmount(lineItems: QuoteLineItem[]): number {
  return lineItems.reduce((sum, item) => sum + item.total, 0)
}

// Get next version number for a project
async function getNextVersion(projectId: string): Promise<number> {
  const { data } = await supabase
    .from('quotes')
    .select('version')
    .eq('project_id', projectId)
    .order('version', { ascending: false })
    .limit(1)
    .single()

  return (data?.version || 0) + 1
}

export async function createQuote(projectId: string, data: QuoteFormData): Promise<{ quote: Quote | null; error: Error | null }> {
  const version = await getNextVersion(projectId)
  const amount = calculateAmount(data.line_items)

  const { data: quote, error } = await supabase
    .from('quotes')
    .insert({
      project_id: projectId,
      version,
      amount,
      line_items: data.line_items,
      notes: data.notes,
      validity_days: data.validity_days,
      status: 'draft'
    })
    .select()
    .single()

  return { quote, error }
}

export async function getQuotesByProject(projectId: string): Promise<{ quotes: Quote[]; error: Error | null }> {
  const { data: quotes, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('project_id', projectId)
    .order('version', { ascending: false })

  return { quotes: quotes || [], error }
}

export async function getQuote(id: string): Promise<{ quote: Quote | null; error: Error | null }> {
  const { data: quote, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', id)
    .single()

  return { quote, error }
}

export async function updateQuote(id: string, data: Partial<QuoteFormData>): Promise<{ quote: Quote | null; error: Error | null }> {
  const updateData: Record<string, unknown> = {}

  if (data.line_items !== undefined) {
    updateData.line_items = data.line_items
    updateData.amount = calculateAmount(data.line_items)
  }
  if (data.notes !== undefined) {
    updateData.notes = data.notes
  }
  if (data.validity_days !== undefined) {
    updateData.validity_days = data.validity_days
  }

  const { data: quote, error } = await supabase
    .from('quotes')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  return { quote, error }
}

export async function deleteQuote(id: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('quotes')
    .delete()
    .eq('id', id)

  return { error }
}

export async function sendQuote(id: string): Promise<{ quote: Quote | null; error: Error | null }> {
  const { data: quote, error } = await supabase
    .from('quotes')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  return { quote, error }
}

export async function updateQuoteStatus(id: string, status: 'accepted' | 'rejected' | 'expired'): Promise<{ quote: Quote | null; error: Error | null }> {
  const updateData: Record<string, unknown> = { status }

  if (status === 'accepted') {
    updateData.accepted_at = new Date().toISOString()
  }

  const { data: quote, error } = await supabase
    .from('quotes')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  return { quote, error }
}
