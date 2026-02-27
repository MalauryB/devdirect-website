"use client"

import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface DocumentDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  uploading: boolean
}

export function DocumentDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  uploading,
}: DocumentDeleteDialogProps) {
  const { t } = useLanguage()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('globalDocuments.deleteTitle')}</DialogTitle>
          <DialogDescription>
            {t('globalDocuments.deleteDescription')}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={uploading}
            variant="destructive"
          >
            {uploading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {t('globalDocuments.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
