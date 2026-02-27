"use client"

import { useState, useEffect } from "react"
import { FileText, Loader2, Download, Image as ImageIcon } from "lucide-react"
import { ProjectFile } from "@/lib/types"
import { getSignedUrl } from "@/lib/storage"

// Component to display a file item with download capability
export function ProjectFileItem({ file }: { file: ProjectFile }) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    const { url } = await getSignedUrl('projects', file.path)
    if (url) {
      window.open(url, '_blank')
    }
    setLoading(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-lg">
      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
        <FileText className="w-5 h-5 text-foreground/50" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
        <p className="text-xs text-foreground/50">{formatFileSize(file.size)}</p>
      </div>
      <button
        onClick={handleDownload}
        disabled={loading}
        className="p-2 hover:bg-muted rounded transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-foreground/50" />
        ) : (
          <Download className="w-4 h-4 text-foreground/50" />
        )}
      </button>
    </div>
  )
}

// Component to display an image item with preview
export function ProjectImageItem({ file }: { file: ProjectFile }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadImage = async () => {
      const { url } = await getSignedUrl('projects', file.path)
      setImageUrl(url)
      setLoading(false)
    }
    loadImage()
  }, [file.path])

  const handleOpen = () => {
    if (imageUrl) {
      window.open(imageUrl, '_blank')
    }
  }

  return (
    <div
      onClick={handleOpen}
      className="aspect-square rounded-lg overflow-hidden bg-muted border border-border cursor-pointer hover:border-primary/30 transition-colors relative"
    >
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-foreground/30" />
        </div>
      ) : imageUrl ? (
        <img
          src={imageUrl}
          alt={file.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-foreground/30" />
        </div>
      )}
    </div>
  )
}
