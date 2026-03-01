"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { ProjectContract, ContractType, ContractStatus } from "@/lib/types"
import { getContractTypeLabel, getContractStatusLabel } from "@/lib/contracts"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
  FileText,
  Send,
  Download,
  Eye,
  FileSignature,
  FileCheck,
  FilePlus2,
  Calendar,
  AlertCircle,
  Undo2
} from "lucide-react"

const STATUS_CONFIG: Record<ContractStatus, { color: string; bgColor: string }> = {
  draft: {
    color: 'text-foreground/70',
    bgColor: 'bg-muted'
  },
  sent: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-100'
  },
  signed: {
    color: 'text-green-700',
    bgColor: 'bg-green-100'
  },
  cancelled: {
    color: 'text-red-700',
    bgColor: 'bg-red-100'
  }
}

const TYPE_ICONS: Record<ContractType, React.ReactNode> = {
  service_agreement: <FileText className="w-4 h-4" />,
  time_and_materials: <FileSignature className="w-4 h-4" />,
  terms_of_sale: <FileCheck className="w-4 h-4" />,
  amendment: <FilePlus2 className="w-4 h-4" />
}

interface ContractListItemProps {
  contract: ProjectContract
  isEngineer: boolean
  exporting: string | null
  onPreview: (contract: ProjectContract) => void
  onExport: (contract: ProjectContract) => void
  onEdit: (contract: ProjectContract) => void
  onDelete: (contract: ProjectContract) => void
  onStatusChange: (contract: ProjectContract, newStatus: ContractStatus) => void
  formatDate: (dateStr: string | null) => string
}

export function ContractListItem({
  contract,
  isEngineer,
  exporting,
  onPreview,
  onExport,
  onEdit,
  onDelete,
  onStatusChange,
  formatDate,
}: ContractListItemProps) {
  const { t } = useLanguage()

  const statusConfig = STATUS_CONFIG[contract.status]
  // Check if T&M contract is missing required profiles
  const isIncomplete = contract.type === 'time_and_materials' &&
    (!contract.profiles || contract.profiles.length === 0 ||
     !contract.profiles.some(p => p.profile_name && p.daily_rate > 0))

  return (
    <div
      className={`bg-white border rounded-xl p-4 hover:border-border transition-colors ${isIncomplete ? 'border-amber-300 bg-amber-50/30' : 'border-border'}`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
          {TYPE_ICONS[contract.type]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="font-medium text-foreground">
                {contract.title}
              </h4>
              <p className="text-sm text-foreground/60 mt-1">
                {getContractTypeLabel(contract.type, t)}
                {contract.version > 1 && ` - v${contract.version}`}
              </p>
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-2 shrink-0">
              {isIncomplete && (
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-amber-100 text-amber-700 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {t('contracts.incomplete')}
                </span>
              )}
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                {getContractStatusLabel(contract.status, t)}
              </span>
            </div>
          </div>

          {/* Incomplete warning */}
          {isIncomplete && (
            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{t('contracts.incompleteWarning')}</span>
            </div>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-foreground/50">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {t('contracts.createdAt')}: {formatDate(contract.created_at)}
            </span>
            {contract.sent_at && (
              <span className="flex items-center gap-1">
                <Send className="w-3 h-3" />
                {t('contracts.sentAt')}: {formatDate(contract.sent_at)}
              </span>
            )}
            {contract.signed_at && (
              <span className="flex items-center gap-1 text-green-600">
                <FileSignature className="w-3 h-3" />
                {t('contracts.signedAt')}: {formatDate(contract.signed_at)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreview(contract)}
            className="gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            {t('contracts.preview')}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport(contract)}
            disabled={exporting === contract.id}
            className="gap-1"
          >
            {exporting === contract.id ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            PDF
          </Button>

          {isEngineer && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-muted rounded-lg" aria-label="Options du contrat">
                  <MoreVertical className="w-4 h-4 text-foreground/50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {contract.status === 'draft' && (
                  <>
                    <DropdownMenuItem onClick={() => onEdit(contract)}>
                      <Pencil className="w-3 h-3 mr-2" />
                      {t('common.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange(contract, 'sent')}>
                      <Send className="w-3 h-3 mr-2" />
                      {t('contracts.markAsSent')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {contract.status === 'sent' && (
                  <>
                    <DropdownMenuItem onClick={() => onStatusChange(contract, 'signed')}>
                      <FileSignature className="w-3 h-3 mr-2" />
                      {t('contracts.markAsSigned')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange(contract, 'cancelled')}>
                      <Trash2 className="w-3 h-3 mr-2" />
                      {t('contracts.markAsCancelled')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {contract.status === 'signed' && (
                  <>
                    <DropdownMenuItem onClick={() => onStatusChange(contract, 'sent')}>
                      <Undo2 className="w-3 h-3 mr-2" />
                      {t('contracts.unsign')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {contract.status === 'draft' && (
                  <DropdownMenuItem
                    onClick={() => onDelete(contract)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-3 h-3 mr-2" />
                    {t('common.delete')}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  )
}
