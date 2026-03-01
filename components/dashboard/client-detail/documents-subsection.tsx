"use client"

import { useState } from "react"
import {
  Loader2,
  FolderOpen,
  Download,
  Upload,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/contexts/language-context"
import type { Project, ProjectDocument, ProjectDocumentType } from "@/lib/types"
import { uploadDocument, getDocumentDownloadUrl, getFileIcon, formatFileSize } from "@/lib/documents"
import type { UserMetadata } from "@/contexts/auth-context"

interface DocumentsSubsectionProps {
  project: Project
  documents: ProjectDocument[]
  documentsLoading: boolean
  user: { id: string; email?: string; user_metadata?: UserMetadata }
  accessToken?: string
  onLoadDocuments: (projectId: string) => void
}

export function DocumentsSubsection({
  project,
  documents,
  documentsLoading,
  user,
  accessToken,
  onLoadDocuments,
}: DocumentsSubsectionProps) {
  const { t } = useLanguage()
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadingDocument, setUploadingDocument] = useState(false)

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-foreground">{t('documents.title')}</h3>
          <p className="text-sm text-foreground/50">{t('documents.clientSubtitle')}</p>
        </div>
        <Button
          onClick={() => setShowUploadModal(true)}
          className="bg-action hover:bg-action/90 text-white"
        >
          <Upload className="w-4 h-4 mr-2" />
          {t('documents.upload')}
        </Button>
      </div>

      {/* Upload Modal for Client */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">{t('documents.uploadModal.title')}</h3>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const formData = new FormData(form)
                const name = formData.get('name') as string
                const description = formData.get('description') as string
                const type = formData.get('type') as ProjectDocumentType
                const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement
                const file = fileInput?.files?.[0]

                if (!file || !name || !type) return

                setUploadingDocument(true)
                const { error } = await uploadDocument(project.id, file, {
                  name,
                  description: description || undefined,
                  type
                })
                setUploadingDocument(false)

                if (!error) {
                  setShowUploadModal(false)
                  onLoadDocuments(project.id)
                }
              }}
              className="p-4 space-y-4"
            >
              <div>
                <Label htmlFor="doc-name-client">{t('documents.uploadModal.name')}</Label>
                <Input
                  id="doc-name-client"
                  name="name"
                  placeholder={t('documents.uploadModal.namePlaceholder')}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="doc-description-client">{t('documents.uploadModal.description')}</Label>
                <Textarea
                  id="doc-description-client"
                  name="description"
                  placeholder={t('documents.uploadModal.descriptionPlaceholder')}
                  className="mt-1"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="doc-type-client">{t('documents.uploadModal.type')}</Label>
                <select
                  id="doc-type-client"
                  name="type"
                  required
                  className="mt-1 w-full bg-white border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                >
                  <option value="specification">{t('documents.types.specification')}</option>
                  <option value="planning">{t('documents.types.planning')}</option>
                  <option value="mockup">{t('documents.types.mockup')}</option>
                  <option value="other">{t('documents.types.other')}</option>
                </select>
              </div>
              <div>
                <Label htmlFor="doc-file-client">{t('documents.uploadModal.file')}</Label>
                <Input
                  id="doc-file-client"
                  name="file"
                  type="file"
                  required
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1"
                >
                  {t('documents.uploadModal.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={uploadingDocument}
                  className="flex-1 bg-action hover:bg-action/90 text-white"
                >
                  {uploadingDocument ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('documents.uploadModal.uploading')}
                    </>
                  ) : (
                    t('documents.uploadModal.submit')
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Documents List */}
      {documentsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-foreground/50" />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 border border-border rounded-xl">
          <FolderOpen className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
          <p className="text-foreground/70 font-medium">{t('documents.empty')}</p>
          <p className="text-foreground/50 text-sm mt-1">{t('documents.emptyClientDescription')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
            >
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
                        className="text-foreground/70 hover:text-foreground"
                        aria-label="Telecharger le document"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {doc.description && (
                    <p className="text-sm text-foreground/60 mt-2">{doc.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-foreground/50">
                    <span>{doc.file_name}</span>
                    <span>{formatFileSize(doc.file_size)}</span>
                    <span>{new Date(doc.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
