"use client"

import { useState } from "react"
import {
  Loader2,
  Trash2,
  Download,
  UploadCloud,
  History,
  ChevronRight,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import type { ProjectDocument } from "@/lib/types"
import { getDocumentDownloadUrl, getFileIcon, formatFileSize, uploadNewVersion, getDocumentVersions, deleteDocument } from "@/lib/documents"

interface DocumentCardProps {
  doc: ProjectDocument
  isEngineer: boolean
  projectId: string
  onReload: () => void
}

export function DocumentCard({ doc, isEngineer, projectId, onReload }: DocumentCardProps) {
  const { t } = useLanguage()
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null)
  const [uploadingNewVersion, setUploadingNewVersion] = useState(false)
  const [expandedVersions, setExpandedVersions] = useState(false)
  const [documentVersions, setDocumentVersions] = useState<ProjectDocument[]>([])

  return (
    <div className="bg-white border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl flex-shrink-0">
          {getFileIcon(doc.file_type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground truncate">{doc.name}</h4>
                <span className="text-xs bg-muted text-foreground px-1.5 py-0.5 rounded font-medium">
                  v{doc.version}
                </span>
              </div>
              <span className="inline-block text-xs bg-muted text-foreground/70 px-2 py-0.5 rounded mt-1">
                {t(`documents.types.${doc.type}`)}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Download button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  const { url } = await getDocumentDownloadUrl(doc.file_path)
                  if (url) window.open(url, '_blank')
                }}
                className="text-foreground/60 hover:text-foreground"
                title={t('documents.download')}
                aria-label="Telecharger le document"
              >
                <Download className="w-4 h-4" />
              </Button>
              {/* Engineer-only actions */}
              {isEngineer && (
                <>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        setUploadingNewVersion(true)
                        const { error } = await uploadNewVersion(doc.id, file)
                        setUploadingNewVersion(false)
                        if (!error) onReload()
                        e.target.value = ''
                      }}
                      disabled={uploadingNewVersion}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="text-foreground/60 hover:text-foreground"
                      title={t('documents.newVersion')}
                    >
                      <span>
                        {uploadingNewVersion ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <UploadCloud className="w-4 h-4" />
                        )}
                      </span>
                    </Button>
                  </label>
                  {/* Delete button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      if (confirm(t('documents.deleteConfirm'))) {
                        setDeletingDocumentId(doc.id)
                        await deleteDocument(doc.id)
                        setDeletingDocumentId(null)
                        onReload()
                      }
                    }}
                    disabled={deletingDocumentId === doc.id}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    title={t('documents.delete')}
                    aria-label="Supprimer le document"
                  >
                    {deletingDocumentId === doc.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
          {doc.description && (
            <p className="text-sm text-foreground/60 mt-2">{doc.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-foreground/50">
            <span>{doc.file_name}</span>
            <span>{formatFileSize(doc.file_size)}</span>
            {doc.uploader ? (
              <span>
                {t('documents.uploadedBy')} {doc.uploader.first_name} {doc.uploader.last_name} {t('documents.uploadedOn')} {new Date(doc.created_at).toLocaleDateString()}
              </span>
            ) : (
              <span>{new Date(doc.created_at).toLocaleDateString('fr-FR')}</span>
            )}
          </div>
          {/* Version history toggle */}
          {doc.version > 1 && (
            <button
              onClick={async () => {
                if (expandedVersions) {
                  setExpandedVersions(false)
                  setDocumentVersions([])
                } else {
                  setExpandedVersions(true)
                  const { versions } = await getDocumentVersions(doc.id)
                  setDocumentVersions(versions)
                }
              }}
              className="flex items-center gap-1 mt-3 text-xs text-foreground hover:text-foreground/80 transition-colors"
            >
              <History className="w-3 h-3" />
              {expandedVersions ? t('documents.hideVersions') : t('documents.viewVersions')}
              {expandedVersions ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          )}
          {/* Version history list */}
          {expandedVersions && documentVersions.length > 0 && (
            <div className="mt-3 pl-3 border-l-2 border-border space-y-2">
              {documentVersions.filter(v => v.id !== doc.id).map((version) => (
                <div key={version.id} className="flex items-center justify-between text-xs text-foreground/60">
                  <div className="flex items-center gap-2">
                    <span className="bg-muted px-1.5 py-0.5 rounded">v{version.version}</span>
                    <span>{version.file_name}</span>
                    <span>({formatFileSize(version.file_size)})</span>
                    <span>{new Date(version.created_at).toLocaleDateString()}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      const { url } = await getDocumentDownloadUrl(version.file_path)
                      if (url) window.open(url, '_blank')
                    }}
                    className="h-6 w-6 p-0 text-foreground/50 hover:text-foreground"
                    aria-label={`Telecharger la version ${version.version}`}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
