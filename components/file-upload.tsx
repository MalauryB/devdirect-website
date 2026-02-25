"use client"

import { useState, useRef } from "react"
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { uploadFile, uploadMultipleFiles, deleteFile, validateFile, UploadedFile } from "@/lib/storage"
import { ProjectFile } from "@/lib/types"

interface FileUploadProps {
  bucket: string
  folder: string
  multiple?: boolean
  accept?: 'images' | 'documents' | 'all'
  value?: ProjectFile | ProjectFile[] | null
  onChange: (files: ProjectFile | ProjectFile[] | null) => void
  label?: string
  description?: string
  disabled?: boolean
}

export function FileUpload({
  bucket,
  folder,
  multiple = false,
  accept = 'all',
  value,
  onChange,
  label,
  description,
  disabled = false
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const files = Array.isArray(value) ? value : value ? [value] : []

  const acceptTypes = accept === 'images'
    ? 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml'
    : accept === 'documents'
    ? 'application/pdf,.doc,.docx'
    : 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml,application/pdf,.doc,.docx'

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) return

    setError(null)
    setUploading(true)

    // Validate files
    for (const file of selectedFiles) {
      const validation = validateFile(file, accept)
      if (!validation.valid) {
        setError(validation.error || 'Fichier invalide')
        setUploading(false)
        return
      }
    }

    if (multiple) {
      const { data, errors } = await uploadMultipleFiles(selectedFiles, bucket, folder)
      if (errors.length > 0) {
        setError('Erreur lors de l\'upload de certains fichiers')
      }
      if (data.length > 0) {
        onChange([...files, ...data])
      }
    } else {
      const { data, error: uploadError } = await uploadFile(selectedFiles[0], bucket, folder)
      if (uploadError) {
        setError('Erreur lors de l\'upload du fichier')
      } else if (data) {
        onChange(data)
      }
    }

    setUploading(false)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleRemove = async (fileToRemove: ProjectFile) => {
    await deleteFile(bucket, fileToRemove.path)

    if (multiple) {
      const newFiles = files.filter(f => f.path !== fileToRemove.path)
      onChange(newFiles.length > 0 ? newFiles : null)
    } else {
      onChange(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const isImage = (type: string) => type.startsWith('image/')

  return (
    <div className="space-y-3">
      {label && (
        <div>
          <p className="text-sm font-medium text-foreground/70">{label}</p>
          {description && (
            <p className="text-xs text-foreground/50 mt-0.5">{description}</p>
          )}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={file.path || index}
              className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-lg"
            >
              {isImage(file.type) ? (
                <div className="w-10 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-foreground/50" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <p className="text-xs text-foreground/50">{formatFileSize(file.size)}</p>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(file)}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  <X className="w-4 h-4 text-foreground/50" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {(!value || multiple) && !disabled && (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept={acceptTypes}
            multiple={multiple}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading || disabled}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || disabled}
            className="w-full border-2 border-dashed border-border rounded-lg p-4 hover:border-border hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex flex-col items-center gap-2">
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-foreground/50" />
              ) : (
                <Upload className="w-6 h-6 text-foreground/50" />
              )}
              <span className="text-sm text-foreground/60">
                {uploading ? 'Upload en cours...' : 'Cliquez pour ajouter un fichier'}
              </span>
              <span className="text-xs text-foreground/40">
                {accept === 'images' && 'PNG, JPG, GIF, SVG (max 2MB)'}
                {accept === 'documents' && 'PDF, DOC, DOCX (max 10MB)'}
                {accept === 'all' && 'Images (max 2MB) ou documents (max 10MB)'}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
