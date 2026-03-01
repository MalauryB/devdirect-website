"use client"

import { useState } from "react"
import {
  Loader2,
  FolderOpen,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import type { Project, ProjectDocument, ProjectDocumentType } from "@/lib/types"
import { uploadDocument } from "@/lib/documents"
import { DocumentUploadModal } from "./document-upload-modal"
import { DocumentCard } from "./document-card"

interface DocumentsSubsectionProps {
  project: Project
  documents: ProjectDocument[]
  documentsLoading: boolean
  isEngineer: boolean
  onLoadDocuments: (projectId: string) => void
}

export function DocumentsSubsection({
  project,
  documents,
  documentsLoading,
  isEngineer,
  onLoadDocuments,
}: DocumentsSubsectionProps) {
  const { t } = useLanguage()
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadingDocument, setUploadingDocument] = useState(false)

  const handleUpload = async (data: { name: string; description?: string; type: ProjectDocumentType; file: File }) => {
    setUploadingDocument(true)
    const { error } = await uploadDocument(project.id, data.file, {
      name: data.name,
      description: data.description,
      type: data.type
    })
    setUploadingDocument(false)
    if (!error) {
      setShowUploadModal(false)
      onLoadDocuments(project.id)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-foreground">{t('documents.title')}</h3>
          <p className="text-sm text-foreground/50">
            {isEngineer ? t('documents.subtitle') : t('documents.clientSubtitle')}
          </p>
        </div>
        <Button
          onClick={() => setShowUploadModal(true)}
          className="bg-action hover:bg-action/90 text-white"
        >
          <Upload className="w-4 h-4 mr-2" />
          {t('documents.upload')}
        </Button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <DocumentUploadModal
          uploading={uploadingDocument}
          isEngineer={isEngineer}
          onClose={() => setShowUploadModal(false)}
          onSubmit={handleUpload}
        />
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
          <p className="text-foreground/50 text-sm mt-1">
            {isEngineer ? t('documents.emptyDescription') : t('documents.emptyClientDescription')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              isEngineer={isEngineer}
              projectId={project.id}
              onReload={() => onLoadDocuments(project.id)}
            />
          ))}
        </div>
      )}
    </>
  )
}
