"use client"

import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/contexts/language-context"
import type { ProjectDocumentType } from "@/lib/types"

interface DocumentUploadModalProps {
  uploading: boolean
  isEngineer: boolean
  onClose: () => void
  onSubmit: (data: { name: string; description?: string; type: ProjectDocumentType; file: File }) => void
  idPrefix?: string
}

export function DocumentUploadModal({ uploading, isEngineer, onClose, onSubmit, idPrefix = 'doc' }: DocumentUploadModalProps) {
  const { t } = useLanguage()

  // Engineer gets all document types, client gets a subset
  const engineerTypes: ProjectDocumentType[] = [
    'signed_quote', 'contract', 'invoice', 'kickoff', 'steering_committee',
    'documentation', 'specification', 'mockup', 'deliverable', 'other'
  ]
  const clientTypes: ProjectDocumentType[] = ['specification', 'planning', 'mockup', 'other']
  const documentTypes = isEngineer ? engineerTypes : clientTypes

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">{t('documents.uploadModal.title')}</h3>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const form = e.target as HTMLFormElement
            const formData = new FormData(form)
            const name = formData.get('name') as string
            const description = formData.get('description') as string
            const type = formData.get('type') as ProjectDocumentType
            const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement
            const file = fileInput?.files?.[0]

            if (!file || !name || !type) return
            onSubmit({ name, description: description || undefined, type, file })
          }}
          className="p-4 space-y-4"
        >
          <div>
            <Label htmlFor={`${idPrefix}-name`}>{t('documents.uploadModal.name')}</Label>
            <Input
              id={`${idPrefix}-name`}
              name="name"
              placeholder={t('documents.uploadModal.namePlaceholder')}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor={`${idPrefix}-description`}>{t('documents.uploadModal.description')}</Label>
            <Textarea
              id={`${idPrefix}-description`}
              name="description"
              placeholder={t('documents.uploadModal.descriptionPlaceholder')}
              className="mt-1"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor={`${idPrefix}-type`}>{t('documents.uploadModal.type')}</Label>
            <select
              id={`${idPrefix}-type`}
              name="type"
              required
              className="mt-1 w-full bg-white border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            >
              {documentTypes.map(type => (
                <option key={type} value={type}>{t(`documents.types.${type}`)}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor={`${idPrefix}-file`}>{t('documents.uploadModal.file')}</Label>
            <Input
              id={`${idPrefix}-file`}
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
              onClick={onClose}
              className="flex-1"
            >
              {t('documents.uploadModal.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-action hover:bg-action/90 text-white"
            >
              {uploading ? (
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
  )
}
