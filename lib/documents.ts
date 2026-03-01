"use client"

import { supabase } from './supabase'
import { ProjectDocument, ProjectDocumentType } from './types'

const BUCKET_NAME = 'project-documents'

// Récupérer tous les documents d'un projet (seulement les dernières versions)
export async function getProjectDocuments(projectId: string): Promise<{
  documents: ProjectDocument[]
  error: string | null
}> {
  const { data, error } = await supabase
    .from('project_documents')
    .select(`
      *,
      uploader:profiles!uploaded_by(id, first_name, last_name, avatar_url, role)
    `)
    .eq('project_id', projectId)
    .eq('is_latest', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching project documents:', error)
    return { documents: [], error: error.message }
  }

  return { documents: data || [], error: null }
}

// Récupérer toutes les versions d'un document
export async function getDocumentVersions(documentId: string): Promise<{
  versions: ProjectDocument[]
  error: string | null
}> {
  // D'abord récupérer le document pour trouver le parent_id ou l'id original
  const { data: doc, error: fetchError } = await supabase
    .from('project_documents')
    .select('id, parent_id')
    .eq('id', documentId)
    .single()

  if (fetchError || !doc) {
    return { versions: [], error: fetchError?.message || 'Document not found' }
  }

  // Le parent_id du premier document est null, donc on cherche par l'id original
  const originalId = doc.parent_id || doc.id

  // Validate UUID format to prevent query injection
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(originalId)) {
    return { versions: [], error: 'Invalid document ID format' }
  }

  const { data, error } = await supabase
    .from('project_documents')
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

// Uploader un document
export async function uploadDocument(
  projectId: string,
  file: File,
  documentData: {
    name: string
    description?: string
    type: ProjectDocumentType
  }
): Promise<{ document: ProjectDocument | null; error: string | null }> {
  // Récupérer l'utilisateur actuel
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { document: null, error: 'User not authenticated' }
  }

  // Générer un chemin unique pour le fichier
  const fileExt = file.name.split('.').pop()
  const fileName = `${projectId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  // Upload le fichier dans le bucket
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

  // Créer l'entrée dans la base de données
  const { data, error: insertError } = await supabase
    .from('project_documents')
    .insert({
      project_id: projectId,
      uploaded_by: user.id,
      name: documentData.name,
      description: documentData.description || null,
      type: documentData.type,
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
    // Supprimer le fichier uploadé en cas d'erreur
    await supabase.storage.from(BUCKET_NAME).remove([fileName])
    return { document: null, error: insertError.message }
  }

  return { document: data, error: null }
}

// Uploader une nouvelle version d'un document existant
export async function uploadNewVersion(
  documentId: string,
  file: File
): Promise<{ document: ProjectDocument | null; error: string | null }> {
  // Récupérer l'utilisateur actuel
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { document: null, error: 'User not authenticated' }
  }

  // Récupérer le document existant
  const { data: existingDoc, error: fetchError } = await supabase
    .from('project_documents')
    .select('*')
    .eq('id', documentId)
    .single()

  if (fetchError || !existingDoc) {
    return { document: null, error: fetchError?.message || 'Document not found' }
  }

  // Déterminer l'ID parent (le premier document de la chaîne)
  const parentId = existingDoc.parent_id || existingDoc.id
  const newVersion = existingDoc.version + 1

  // Générer un chemin unique pour le nouveau fichier
  const fileExt = file.name.split('.').pop()
  const fileName = `${existingDoc.project_id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  // Upload le fichier dans le bucket
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

  // Marquer l'ancien document comme non-latest
  const { error: updateError } = await supabase
    .from('project_documents')
    .update({ is_latest: false })
    .eq('id', documentId)

  if (updateError) {
    console.error('Error updating old document:', updateError)
    // Supprimer le fichier uploadé en cas d'erreur
    await supabase.storage.from(BUCKET_NAME).remove([fileName])
    return { document: null, error: updateError.message }
  }

  // Créer la nouvelle version
  const { data, error: insertError } = await supabase
    .from('project_documents')
    .insert({
      project_id: existingDoc.project_id,
      uploaded_by: user.id,
      name: existingDoc.name,
      description: existingDoc.description,
      type: existingDoc.type,
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
    // Remettre l'ancien document comme latest
    await supabase.from('project_documents').update({ is_latest: true }).eq('id', documentId)
    // Supprimer le fichier uploadé
    await supabase.storage.from(BUCKET_NAME).remove([fileName])
    return { document: null, error: insertError.message }
  }

  return { document: data, error: null }
}

// Supprimer un document
export async function deleteDocument(documentId: string): Promise<{ error: string | null }> {
  // D'abord récupérer le document pour avoir le chemin du fichier
  const { data: document, error: fetchError } = await supabase
    .from('project_documents')
    .select('file_path')
    .eq('id', documentId)
    .single()

  if (fetchError || !document) {
    return { error: fetchError?.message || 'Document not found' }
  }

  // Supprimer le fichier du storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([document.file_path])

  if (storageError) {
    console.error('Error deleting file from storage:', storageError)
    // On continue quand même pour supprimer l'entrée DB
  }

  // Supprimer l'entrée de la base de données
  const { error: deleteError } = await supabase
    .from('project_documents')
    .delete()
    .eq('id', documentId)

  if (deleteError) {
    return { error: deleteError.message }
  }

  return { error: null }
}

// Mettre à jour un document (métadonnées uniquement)
export async function updateDocument(
  documentId: string,
  updates: {
    name?: string
    description?: string
    type?: ProjectDocumentType
  }
): Promise<{ document: ProjectDocument | null; error: string | null }> {
  const { data, error } = await supabase
    .from('project_documents')
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

// Obtenir l'URL signée pour télécharger un document
export async function getDocumentDownloadUrl(filePath: string): Promise<{
  url: string | null
  error: string | null
}> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, 3600) // URL valide 1 heure

  if (error) {
    return { url: null, error: error.message }
  }

  return { url: data.signedUrl, error: null }
}

// Labels pour les types de documents
export const documentTypeLabels: Record<ProjectDocumentType, { fr: string; en: string }> = {
  signed_quote: { fr: 'Devis signé', en: 'Signed Quote' },
  contract: { fr: 'Contrat', en: 'Contract' },
  invoice: { fr: 'Facture', en: 'Invoice' },
  kickoff: { fr: 'Kick-off', en: 'Kick-off' },
  steering_committee: { fr: 'Comité de suivi', en: 'Steering Committee' },
  documentation: { fr: 'Documentation', en: 'Documentation' },
  specification: { fr: 'Cahier des charges', en: 'Specification' },
  planning: { fr: 'Planning prévisionnel', en: 'Project Planning' },
  mockup: { fr: 'Maquette', en: 'Mockup' },
  deliverable: { fr: 'Livrable', en: 'Deliverable' },
  other: { fr: 'Autre', en: 'Other' }
}

// Icônes pour les types de fichiers (basées sur le MIME type)
export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType === 'application/pdf') return '📄'
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️'
  if (mimeType.startsWith('video/')) return '🎬'
  if (mimeType.startsWith('audio/')) return '🎵'
  if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed')) return '📦'
  return '📎'
}

// Formater la taille du fichier
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
