"use client"

import { useLanguage } from "@/contexts/language-context"
import {
  GlobalDocument,
  globalDocumentTypeLabels,
} from "@/lib/global-documents"
import { getFileIcon, formatFileSize } from "@/lib/documents"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Upload,
  Download,
  Trash2,
  MoreHorizontal,
  FileText,
  Edit,
  RefreshCw,
} from "lucide-react"

interface DocumentTableProps {
  documents: GlobalDocument[]
  onDownload: (doc: GlobalDocument) => void
  onEdit: (doc: GlobalDocument) => void
  onDelete: (doc: GlobalDocument) => void
  onUploadVersion: (doc: GlobalDocument) => void
  onUploadClick: () => void
}

export function DocumentTable({
  documents,
  onDownload,
  onEdit,
  onDelete,
  onUploadVersion,
  onUploadClick,
}: DocumentTableProps) {
  const { t, language } = useLanguage()

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 border rounded-xl">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          {t('globalDocuments.noDocuments')}
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-4">
          {t('globalDocuments.noDocumentsDescription')}
        </p>
        <Button onClick={onUploadClick} variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          {t('globalDocuments.uploadFirst')}
        </Button>
      </div>
    )
  }

  return (
    <div className="border rounded-xl overflow-visible">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>{t('globalDocuments.name')}</TableHead>
            <TableHead>{t('globalDocuments.type')}</TableHead>
            <TableHead>{t('globalDocuments.category')}</TableHead>
            <TableHead>{t('globalDocuments.size')}</TableHead>
            <TableHead>{t('globalDocuments.version')}</TableHead>
            <TableHead>{t('globalDocuments.uploadedBy')}</TableHead>
            <TableHead>{t('globalDocuments.date')}</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>
                <span className="text-2xl">{getFileIcon(doc.file_type)}</span>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{doc.name}</p>
                  {doc.description && (
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{doc.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{doc.file_name}</p>
                </div>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-foreground/70">
                  {globalDocumentTypeLabels[doc.type][language]}
                </span>
              </TableCell>
              <TableCell>
                {doc.category ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    {doc.category}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatFileSize(doc.file_size)}
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground">v{doc.version}</span>
              </TableCell>
              <TableCell>
                {doc.uploader ? (
                  <span className="text-sm">
                    {doc.uploader.first_name} {doc.uploader.last_name}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(doc.created_at).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-muted">
                    <MoreHorizontal className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="z-50">
                    <DropdownMenuItem onClick={() => onDownload(doc)}>
                      <Download className="w-4 h-4 mr-2" />
                      {t('globalDocuments.download')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUploadVersion(doc)}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {t('globalDocuments.uploadVersion')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(doc)}>
                      <Edit className="w-4 h-4 mr-2" />
                      {t('globalDocuments.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(doc)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('globalDocuments.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
