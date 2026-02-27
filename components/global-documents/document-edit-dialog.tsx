"use client"

import { useLanguage } from "@/contexts/language-context"
import {
  GlobalDocumentType,
  globalDocumentTypeLabels,
} from "@/lib/global-documents"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

const documentTypes: GlobalDocumentType[] = [
  'template_ppt',
  'template_word',
  'template_excel',
  'email_signature',
  'branding',
  'process',
  'other'
]

interface DocumentEditDialogProps {
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
  onSubmit: () => void
  uploading: boolean
  categories: string[]
}

export function DocumentEditDialog({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  onSubmit,
  uploading,
  categories,
}: DocumentEditDialogProps) {
  const { t, language } = useLanguage()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('globalDocuments.editTitle')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>{t('globalDocuments.documentName')}</Label>
            <Input
              value={formData.name}
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label>{t('globalDocuments.description')}</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
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
                list="categories-edit"
              />
              <datalist id="categories-edit">
                {categories.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!formData.name || uploading}
            className="bg-[#ea4c89] hover:bg-[#ea4c89]/90"
          >
            {uploading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
