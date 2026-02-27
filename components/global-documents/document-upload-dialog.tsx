"use client"

import { useLanguage } from "@/contexts/language-context"
import {
  GlobalDocumentType,
  globalDocumentTypeLabels,
} from "@/lib/global-documents"
import { getFileIcon, formatFileSize } from "@/lib/documents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Upload, Loader2 } from "lucide-react"

const documentTypes: GlobalDocumentType[] = [
  'template_ppt',
  'template_word',
  'template_excel',
  'email_signature',
  'branding',
  'process',
  'other'
]

interface DocumentUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: {
    name: string
    description: string
    type: GlobalDocumentType
    category: string
  }
  onFormDataChange: (data: {
    name: string
    description: string
    type: GlobalDocumentType
    category: string
  }) => void
  selectedFile: File | null
  onFileClick: () => void
  onSubmit: () => void
  uploading: boolean
  categories: string[]
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  selectedFile,
  onFileClick,
  onSubmit,
  uploading,
  categories,
}: DocumentUploadDialogProps) {
  const { t, language } = useLanguage()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('globalDocuments.uploadTitle')}</DialogTitle>
          <DialogDescription>{t('globalDocuments.uploadDescription')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File drop zone */}
          <div
            onClick={onFileClick}
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-[#ea4c89] transition-colors"
          >
            {selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">{getFileIcon(selectedFile.type)}</span>
                <div className="text-left">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">{t('globalDocuments.dropOrClick')}</p>
              </>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <Label>{t('globalDocuments.documentName')}</Label>
              <Input
                value={formData.name}
                onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                placeholder={t('globalDocuments.namePlaceholder')}
              />
            </div>

            <div>
              <Label>{t('globalDocuments.description')}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
                placeholder={t('globalDocuments.descriptionPlaceholder')}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t('globalDocuments.type')}</Label>
                <Select value={formData.type} onValueChange={(v) => onFormDataChange({ ...formData, type: v as GlobalDocumentType })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {globalDocumentTypeLabels[type][language]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('globalDocuments.category')}</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => onFormDataChange({ ...formData, category: e.target.value })}
                  placeholder={t('globalDocuments.categoryPlaceholder')}
                  list="categories"
                />
                <datalist id="categories">
                  {categories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!selectedFile || !formData.name || uploading}
            className="bg-[#ea4c89] hover:bg-[#ea4c89]/90"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
            {t('globalDocuments.upload')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
