"use client"

import { supabase } from './supabase'

export interface UploadedFile {
  name: string
  url: string
  path: string
  size: number
  type: string
}

// Allowed file types
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
const DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const ALL_ALLOWED_TYPES = [...IMAGE_TYPES, ...DOCUMENT_TYPES]

// Max file sizes
const MAX_IMAGE_SIZE = 2 * 1024 * 1024 // 2MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024 // 10MB

export function validateFile(file: File, allowedTypes: 'images' | 'documents' | 'all' = 'all'): { valid: boolean; error?: string } {
  const types = allowedTypes === 'images' ? IMAGE_TYPES : allowedTypes === 'documents' ? DOCUMENT_TYPES : ALL_ALLOWED_TYPES

  if (!types.includes(file.type)) {
    return { valid: false, error: 'Type de fichier non autorisé' }
  }

  const maxSize = IMAGE_TYPES.includes(file.type) ? MAX_IMAGE_SIZE : MAX_DOCUMENT_SIZE
  if (file.size > maxSize) {
    const maxMB = maxSize / (1024 * 1024)
    return { valid: false, error: `Fichier trop volumineux (max ${maxMB}MB)` }
  }

  return { valid: true }
}

export async function uploadFile(
  file: File,
  bucket: string,
  folder: string
): Promise<{ data: UploadedFile | null; error: Error | null }> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: new Error('User not authenticated') }
  }

  // Generate unique filename
  const ext = file.name.split('.').pop()
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const fileName = `${timestamp}-${randomStr}.${ext}`
  const filePath = `${user.id}/${folder}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) {
    return { data: null, error: uploadError }
  }

  // Pour les buckets publics (avatars), utiliser l'URL publique
  // Pour les buckets privés (projects), on stocke juste le path
  let url = ''
  if (bucket === 'avatars') {
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)
    url = publicUrl
  } else {
    // Pour les fichiers privés, on génère une URL signée à la demande
    const { data: signedUrlData } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 3600) // 1 heure
    url = signedUrlData?.signedUrl || ''
  }

  return {
    data: {
      name: file.name,
      url,
      path: filePath,
      size: file.size,
      type: file.type
    },
    error: null
  }
}

export async function uploadMultipleFiles(
  files: File[],
  bucket: string,
  folder: string
): Promise<{ data: UploadedFile[]; errors: Error[] }> {
  const results = await Promise.all(
    files.map(file => uploadFile(file, bucket, folder))
  )

  const data: UploadedFile[] = []
  const errors: Error[] = []

  results.forEach(result => {
    if (result.data) data.push(result.data)
    if (result.error) errors.push(result.error)
  })

  return { data, errors }
}

export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  return { error }
}

export async function deleteMultipleFiles(
  bucket: string,
  paths: string[]
): Promise<{ error: Error | null }> {
  if (paths.length === 0) return { error: null }

  const { error } = await supabase.storage
    .from(bucket)
    .remove(paths)

  return { error }
}

// Générer une URL signée pour un fichier privé
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600 // 1 heure par défaut
): Promise<{ url: string | null; error: Error | null }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  return { url: data?.signedUrl || null, error }
}

// Générer des URLs signées pour plusieurs fichiers
export async function getSignedUrls(
  bucket: string,
  paths: string[],
  expiresIn: number = 3600
): Promise<{ urls: { path: string; url: string }[]; error: Error | null }> {
  if (paths.length === 0) return { urls: [], error: null }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrls(paths, expiresIn)

  const urls = data?.map(item => ({
    path: item.path || '',
    url: item.signedUrl
  })) || []

  return { urls, error }
}
