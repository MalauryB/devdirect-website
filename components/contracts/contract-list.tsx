"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { ProjectContract, ContractStatus } from "@/lib/types"
import { Plus, FileSignature } from "lucide-react"
import { ContractListItem } from "@/components/contracts/contract-list-item"

interface ContractListProps {
  contracts: ProjectContract[]
  isEngineer: boolean
  exporting: string | null
  onOpenCreate: () => void
  onPreview: (contract: ProjectContract) => void
  onExport: (contract: ProjectContract) => void
  onEdit: (contract: ProjectContract) => void
  onDelete: (contract: ProjectContract) => void
  onStatusChange: (contract: ProjectContract, newStatus: ContractStatus) => void
  formatDate: (dateStr: string | null) => string
}

export function ContractList({
  contracts,
  isEngineer,
  exporting,
  onOpenCreate,
  onPreview,
  onExport,
  onEdit,
  onDelete,
  onStatusChange,
  formatDate,
}: ContractListProps) {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{t('contracts.title')}</h3>
          <p className="text-sm text-foreground/60">{t('contracts.subtitle')}</p>
        </div>
        {isEngineer && (
          <Button onClick={onOpenCreate} className="gap-2 bg-action hover:bg-action/90 text-white">
            <Plus className="w-4 h-4" />
            {t('contracts.create')}
          </Button>
        )}
      </div>

      {/* Contracts list */}
      {contracts.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <FileSignature className="w-8 h-8 text-foreground/20" />
          </div>
          <h4 className="text-lg font-medium mb-2">{t('contracts.noContracts')}</h4>
          <p className="text-foreground/50 mb-4 max-w-md mx-auto">
            {t('contracts.noContractsDescription')}
          </p>
          {isEngineer && (
            <Button onClick={onOpenCreate} className="bg-action hover:bg-action/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              {t('contracts.createFirst')}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map((contract) => (
            <ContractListItem
              key={contract.id}
              contract={contract}
              isEngineer={isEngineer}
              exporting={exporting}
              onPreview={onPreview}
              onExport={onExport}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
