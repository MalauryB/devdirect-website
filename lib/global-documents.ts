"use client"

import { supabase } from './supabase'

const BUCKET_NAME = 'global-documents'

// Types for global documents
export type GlobalDocumentType =
  | 'template_ppt'
  | 'template_word'
  | 'template_excel'
  | 'email_signature'
  | 'branding'
  | 'process'
  | 'other'

export interface GlobalDocument {
  id: string
  uploaded_by: string
  name: string
  description: string | null
  type: GlobalDocumentType
  category: string | null
  file_path: string
  file_name: string
  file_size: number
  file_type: string
  version: number
  parent_id: string | null
  is_latest: boolean
  created_at: string
  updated_at: string
  uploader?: {
    id: string
    first_name: string
    last_name: string
    avatar_url: string | null
    role: string
  }
}

// Labels for global document types
export const globalDocumentTypeLabels: Record<GlobalDocumentType, { fr: string; en: string }> = {
  template_ppt: { fr: 'Template PowerPoint', en: 'PowerPoint Template' },
  template_word: { fr: 'Template Word', en: 'Word Template' },
  template_excel: { fr: 'Template Excel', en: 'Excel Template' },
  email_signature: { fr: 'Signature email', en: 'Email Signature' },
  branding: { fr: 'Branding / Charte graphique', en: 'Branding / Style Guide' },
  process: { fr: 'Process / Procédure', en: 'Process / Procedure' },
  other: { fr: 'Autre', en: 'Other' }
}

// Get all global documents (only latest versions)
export async function getGlobalDocuments(): Promise<{
  documents: GlobalDocument[]
  error: string | null
}> {
  const { data, error } = await supabase
    .from('global_documents')
    .select(`
      *,
      uploader:profiles!uploaded_by(id, first_name, last_name, avatar_url, role)
    `)
    .eq('is_latest', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching global documents:', error)
    return { documents: [], error: error.message }
  }

  return { documents: data || [], error: null }
}

// Get global documents by type
export async function getGlobalDocumentsByType(type: GlobalDocumentType): Promise<{
  documents: GlobalDocument[]
  error: string | null
}> {
  const { data, error } = await supabase
    .from('global_documents')
    .select(`
      *,
      uploader:profiles!uploaded_by(id, first_name, last_name, avatar_url, role)
    `)
    .eq('type', type)
    .eq('is_latest', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching global documents by type:', error)
    return { documents: [], error: error.message }
  }

  return { documents: data || [], error: null }
}

// Get global documents by category
export async function getGlobalDocumentsByCategory(category: string): Promise<{
  documents: GlobalDocument[]
  error: string | null
}> {
  const { data, error } = await supabase
    .from('global_documents')
    .select(`
      *,
      uploader:profiles!uploaded_by(id, first_name, last_name, avatar_url, role)
    `)
    .eq('category', category)
    .eq('is_latest', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching global documents by category:', error)
    return { documents: [], error: error.message }
  }

  return { documents: data || [], error: null }
}

// Get all versions of a document
export async function getGlobalDocumentVersions(documentId: string): Promise<{
  versions: GlobalDocument[]
  error: string | null
}> {
  // First get the document to find the parent_id or original id
  const { data: doc, error: fetchError } = await supabase
    .from('global_documents')
    .select('id, parent_id')
    .eq('id', documentId)
    .single()

  if (fetchError || !doc) {
    return { versions: [], error: fetchError?.message || 'Document not found' }
  }

  const originalId = doc.parent_id || doc.id

  const { data, error } = await supabase
    .from('global_documents')
    .select(`
      *,
      uploader:profiles!uploaded_by(id, first_name, last_name, avatar_url, role)
    `)
    .or(`id.eq.${originalId},parent_id.eq.${originalId}`)
    .order('version', { ascending: false })

  if (error) {
    console.error('Error fetching document versions:', error)
    return { versions: [], error: error.message }
  }

  return { versions: data || [], error: null }
}

// Upload a global document
export async function uploadGlobalDocument(
  file: File,
  documentData: {
    name: string
    description?: string
    type: GlobalDocumentType
    category?: string
  }
): Promise<{ document: GlobalDocument | null; error: string | null }> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { document: null, error: 'User not authenticated' }
  }

  // Generate unique file path
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  // Upload file to bucket
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) {
    console.error('Error uploading file:', uploadError)
    return { document: null, error: uploadError.message }
  }

  // Create database entry
  const { data, error: insertError } = await supabase
    .from('global_documents')
    .insert({
      uploaded_by: user.id,
      name: documentData.name,
      description: documentData.description || null,
      type: documentData.type,
      category: documentData.category || null,
      file_path: fileName,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      version: 1,
      parent_id: null,
      is_latest: true
    })
    .select(`
      *,
      uploader:profiles!uploaded_by(id, first_name, last_name, avatar_url, role)
    `)
    .single()

  if (insertError) {
    console.error('Error inserting document record:', insertError)
    // Delete uploaded file on error
    await supabase.storage.from(BUCKET_NAME).remove([fileName])
    return { document: null, error: insertError.message }
  }

  return { document: data, error: null }
}

// Upload a new version of an existing document
export async function uploadGlobalDocumentVersion(
  documentId: string,
  file: File
): Promise<{ document: GlobalDocument | null; error: string | null }> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { document: null, error: 'User not authenticated' }
  }

  // Get existing document
  const { data: existingDoc, error: fetchError } = await supabase
    .from('global_documents')
    .select('*')
    .eq('id', documentId)
    .single()

  if (fetchError || !existingDoc) {
    return { document: null, error: fetchError?.message || 'Document not found' }
  }

  // Determine parent ID (first document in the chain)
  const parentId = existingDoc.parent_id || existingDoc.id
  const newVersion = existingDoc.version + 1

  // Generate unique file path
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  // Upload file to bucket
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) {
    console.error('Error uploading file:', uploadError)
    return { document: null, error: uploadError.message }
  }

  // Mark old document as not latest
  const { error: updateError } = await supabase
    .from('global_documents')
    .update({ is_latest: false })
    .eq('id', documentId)

  if (updateError) {
    console.error('Error updating old document:', updateError)
    await supabase.storage.from(BUCKET_NAME).remove([fileName])
    return { document: null, error: updateError.message }
  }

  // Create new version
  const { data, error: insertError } = await supabase
    .from('global_documents')
    .insert({
      uploaded_by: user.id,
      name: existingDoc.name,
      description: existingDoc.description,
      type: existingDoc.type,
      category: existingDoc.category,
      file_path: fileName,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      version: newVersion,
      parent_id: parentId,
      is_latest: true
    })
    .select(`
      *,
      uploader:profiles!uploaded_by(id, first_name, last_name, avatar_url, role)
    `)
    .single()

  if (insertError) {
    console.error('Error inserting new version:', insertError)
    // Restore old document as latest
    await supabase.from('global_documents').update({ is_latest: true }).eq('id', documentId)
    await supabase.storage.from(BUCKET_NAME).remove([fileName])
    return { document: null, error: insertError.message }
  }

  return { document: data, error: null }
}

// Delete a global document
export async function deleteGlobalDocument(documentId: string): Promise<{ error: string | null }> {
  // Get document to find file path
  const { data: document, error: fetchError } = await supabase
    .from('global_documents')
    .select('file_path')
    .eq('id', documentId)
    .single()

  if (fetchError || !document) {
    return { error: fetchError?.message || 'Document not found' }
  }

  // Delete file from storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([document.file_path])

  if (storageError) {
    console.error('Error deleting file from storage:', storageError)
    // Continue to delete DB entry anyway
  }

  // Delete database entry
  const { error: deleteError } = await supabase
    .from('global_documents')
    .delete()
    .eq('id', documentId)

  if (deleteError) {
    return { error: deleteError.message }
  }

  return { error: null }
}

// Update document metadata
export async function updateGlobalDocument(
  documentId: string,
  updates: {
    name?: string
    description?: string
    type?: GlobalDocumentType
    category?: string
  }
): Promise<{ document: GlobalDocument | null; error: string | null }> {
  const { data, error } = await supabase
    .from('global_documents')
    .update(updates)
    .eq('id', documentId)
    .select(`
      *,
      uploader:profiles!uploaded_by(id, first_name, last_name, avatar_url, role)
    `)
    .single()

  if (error) {
    return { document: null, error: error.message }
  }

  return { document: data, error: null }
}

// Get signed download URL
export async function getGlobalDocumentDownloadUrl(filePath: string): Promise<{
  url: string | null
  error: string | null
}> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, 3600) // URL valid for 1 hour

  if (error) {
    return { url: null, error: error.message }
  }

  return { url: data.signedUrl, error: null }
}

// Get all unique categories
export async function getGlobalDocumentCategories(): Promise<{
  categories: string[]
  error: string | null
}> {
  const { data, error } = await supabase
    .from('global_documents')
    .select('category')
    .eq('is_latest', true)
    .not('category', 'is', null)

  if (error) {
    return { categories: [], error: error.message }
  }

  // Get unique categories
  const categories = [...new Set(data.map(d => d.category).filter(Boolean))] as string[]
  return { categories: categories.sort(), error: null }
}
