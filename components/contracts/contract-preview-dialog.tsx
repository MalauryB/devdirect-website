"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Loader2,
  FileText,
  Download,
  AlertCircle,
} from "lucide-react"

interface ContractPreviewDialogProps {
  showPreviewDialog: boolean
  previewPdfUrl: string | null
  previewLoading: boolean
  previewTitle: string | undefined
  onClose: () => void
  onDownload: () => void
}

export function ContractPreviewDialog({
  showPreviewDialog,
  previewPdfUrl,
  previewLoading,
  previewTitle,
  onClose,
  onDownload,
}: ContractPreviewDialogProps) {
  const { t } = useLanguage()

  return (
    <Dialog open={showPreviewDialog} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-3">
            <FileText className="w-5 h-5" />
            {previewTitle || t('contracts.previewTitle')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden bg-muted">
          {previewLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-action" />
              <p className="text-sm text-foreground/60">{t('contracts.generatingPdf')}</p>
            </div>
          ) : previewPdfUrl ? (
            <iframe
              src={previewPdfUrl}
              className="w-full h-full border-0"
              title={previewTitle || 'Contract PDF'}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <p className="text-sm text-foreground/60">{t('contracts.pdfError')}</p>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-white">
          <Button variant="outline" onClick={onClose}>
            {t('common.close')}
          </Button>
          {previewPdfUrl && (
            <Button
              onClick={onDownload}
              className="gap-2 bg-action hover:bg-action/90 text-white"
            >
              <Download className="w-4 h-4" />
              {t('contracts.downloadPdf')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
