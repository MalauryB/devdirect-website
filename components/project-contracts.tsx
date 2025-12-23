"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/language-context"
import { Project, Quote, ProjectContract, ContractType, ContractStatus, Profile } from "@/lib/types"
import {
  getProjectContracts,
  createContract,
  updateContract,
  updateContractStatus,
  deleteContract,
  getContractTypeLabel,
  getContractStatusLabel
} from "@/lib/contracts"
import { exportContractToPdf } from "@/lib/contract-pdf-export"
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Loader2,
  Plus,
  Sparkles,
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
  Calendar
} from "lucide-react"

interface ProjectContractsProps {
  project: Project
  quotes: Quote[]
  client?: Profile | null
  isEngineer: boolean
  provider?: {
    name: string
    address: string
    siret: string
    email: string
    phone: string
  }
}

const STATUS_CONFIG: Record<ContractStatus, { color: string; bgColor: string }> = {
  draft: {
    color: 'text-gray-700',
    bgColor: 'bg-gray-100'
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
  terms_of_sale: <FileCheck className="w-4 h-4" />,
  amendment: <FilePlus2 className="w-4 h-4" />
}

export function ProjectContracts({ project, quotes, client, isEngineer, provider }: ProjectContractsProps) {
  const { t } = useLanguage()
  const [contracts, setContracts] = useState<ProjectContract[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [previewContract, setPreviewContract] = useState<ProjectContract | null>(null)
  const [editingContract, setEditingContract] = useState<ProjectContract | null>(null)
  const [deletingContract, setDeletingContract] = useState<ProjectContract | null>(null)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)

  // Form state
  const [formType, setFormType] = useState<ContractType>('service_agreement')
  const [formQuoteId, setFormQuoteId] = useState<string>('none')
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formValidUntil, setFormValidUntil] = useState('')

  // Load contracts
  useEffect(() => {
    loadContracts()
  }, [project.id])

  const loadContracts = async () => {
    setLoading(true)
    const data = await getProjectContracts(project.id)
    setContracts(data)
    setLoading(false)
  }

  const resetForm = () => {
    setFormType('service_agreement')
    setFormQuoteId('none')
    setFormTitle('')
    setFormContent('')
    setFormValidUntil('')
    setEditingContract(null)
  }

  const handleOpenCreate = () => {
    resetForm()
    setShowCreateDialog(true)
  }

  const handleOpenEdit = (contract: ProjectContract) => {
    setFormType(contract.type)
    setFormQuoteId(contract.quote_id || 'none')
    setFormTitle(contract.title)
    setFormContent(contract.content)
    setFormValidUntil(contract.valid_until || '')
    setEditingContract(contract)
    setShowCreateDialog(true)
  }

  const handlePreview = (contract: ProjectContract) => {
    setPreviewContract(contract)
    setShowPreviewDialog(true)
  }

  const handleGenerateWithAI = async () => {
    setGenerating(true)

    try {
      const selectedQuote = formQuoteId && formQuoteId !== 'none' ? quotes.find(q => q.id === formQuoteId) : null

      const response = await fetch('/api/generate-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project,
          quote: selectedQuote,
          client: client || project.profiles,
          provider: provider || {
            name: 'Memory Agency',
            address: '',
            siret: '',
            email: 'contact@memory-agency.com',
            phone: ''
          },
          contractType: formType,
          language: 'fr'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate contract')
      }

      const data = await response.json()

      if (data.contract) {
        setFormTitle(data.contract.title)
        setFormContent(data.contract.content)
      }
    } catch (error) {
      console.error('Error generating contract:', error)
    }

    setGenerating(false)
  }

  const handleSave = async () => {
    if (!formTitle.trim() || !formContent.trim()) return

    setSaving(true)

    if (editingContract) {
      const updated = await updateContract(editingContract.id, {
        title: formTitle,
        content: formContent,
        type: formType,
        valid_until: formValidUntil || undefined
      })

      if (updated) {
        await loadContracts()
        setShowCreateDialog(false)
        resetForm()
      }
    } else {
      const created = await createContract({
        project_id: project.id,
        quote_id: formQuoteId && formQuoteId !== 'none' ? formQuoteId : undefined,
        type: formType,
        title: formTitle,
        content: formContent,
        valid_until: formValidUntil || undefined
      })

      if (created) {
        await loadContracts()
        setShowCreateDialog(false)
        resetForm()
      }
    }

    setSaving(false)
  }

  const handleStatusChange = async (contract: ProjectContract, newStatus: ContractStatus) => {
    const updated = await updateContractStatus(contract.id, newStatus)
    if (updated) {
      await loadContracts()
    }
  }

  const handleDelete = async () => {
    if (!deletingContract) return

    const success = await deleteContract(deletingContract.id)
    if (success) {
      await loadContracts()
    }
    setDeletingContract(null)
  }

  const handleExportPdf = async (contract: ProjectContract) => {
    setExporting(contract.id)
    try {
      await exportContractToPdf(contract, project, client || project.profiles as Profile | undefined, provider)
    } catch (error) {
      console.error('Error exporting PDF:', error)
    }
    setExporting(null)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-foreground/50" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{t('contracts.title')}</h3>
          <p className="text-sm text-foreground/60">{t('contracts.subtitle')}</p>
        </div>
        {isEngineer && (
          <Button onClick={handleOpenCreate} className="gap-2 bg-action hover:bg-action/90 text-white">
            <Plus className="w-4 h-4" />
            {t('contracts.create')}
          </Button>
        )}
      </div>

      {/* Contracts list */}
      {contracts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <FileSignature className="w-8 h-8 text-foreground/20" />
          </div>
          <h4 className="text-lg font-medium mb-2">{t('contracts.noContracts')}</h4>
          <p className="text-foreground/50 mb-4 max-w-md mx-auto">
            {t('contracts.noContractsDescription')}
          </p>
          {isEngineer && (
            <Button onClick={handleOpenCreate} className="bg-action hover:bg-action/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              {t('contracts.createFirst')}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map((contract) => {
            const statusConfig = STATUS_CONFIG[contract.status]

            return (
              <div
                key={contract.id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
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
                      <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                        {getContractStatusLabel(contract.status, t)}
                      </span>
                    </div>

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
                      onClick={() => handlePreview(contract)}
                      className="gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {t('contracts.preview')}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportPdf(contract)}
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
                          <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <MoreVertical className="w-4 h-4 text-foreground/50" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {contract.status === 'draft' && (
                            <>
                              <DropdownMenuItem onClick={() => handleOpenEdit(contract)}>
                                <Pencil className="w-3 h-3 mr-2" />
                                {t('common.edit')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(contract, 'sent')}>
                                <Send className="w-3 h-3 mr-2" />
                                {t('contracts.markAsSent')}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {contract.status === 'sent' && (
                            <>
                              <DropdownMenuItem onClick={() => handleStatusChange(contract, 'signed')}>
                                <FileSignature className="w-3 h-3 mr-2" />
                                {t('contracts.markAsSigned')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(contract, 'cancelled')}>
                                <Trash2 className="w-3 h-3 mr-2" />
                                {t('contracts.markAsCancelled')}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {contract.status === 'draft' && (
                            <DropdownMenuItem
                              onClick={() => setDeletingContract(contract)}
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
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingContract ? t('contracts.edit') : t('contracts.create')}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
            {/* Contract type */}
            <div className="space-y-2">
              <Label>{t('contracts.type')}</Label>
              <Select value={formType} onValueChange={(v) => setFormType(v as ContractType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service_agreement">{t('contracts.types.serviceAgreement')}</SelectItem>
                  <SelectItem value="terms_of_sale">{t('contracts.types.termsOfSale')}</SelectItem>
                  <SelectItem value="amendment">{t('contracts.types.amendment')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Link to quote (optional) */}
            {quotes.length > 0 && (
              <div className="space-y-2">
                <Label>{t('contracts.linkedQuote')}</Label>
                <Select value={formQuoteId} onValueChange={setFormQuoteId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('contracts.selectQuote')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('contracts.noQuote')}</SelectItem>
                    {quotes.map((quote) => (
                      <SelectItem key={quote.id} value={quote.id}>
                        {quote.name} - v{quote.version}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Generate with AI button */}
            {!editingContract && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleGenerateWithAI}
                  disabled={generating}
                  className="gap-2"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {t('contracts.generateWithAI')}
                </Button>
                <span className="text-xs text-foreground/50">
                  {t('contracts.generateHint')}
                </span>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label>{t('contracts.titleLabel')}</Label>
              <Input
                placeholder={t('contracts.titlePlaceholder')}
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label>{t('contracts.content')}</Label>
              <Textarea
                placeholder={t('contracts.contentPlaceholder')}
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                rows={15}
                className="font-mono text-sm"
              />
              <p className="text-xs text-foreground/50">
                {t('contracts.contentHint')}
              </p>
            </div>

            {/* Valid until */}
            <div className="space-y-2">
              <Label>{t('contracts.validUntil')}</Label>
              <Input
                type="date"
                value={formValidUntil}
                onChange={(e) => setFormValidUntil(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formTitle.trim() || !formContent.trim()}
              className="bg-action hover:bg-action/90 text-white"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editingContract ? t('common.save') : t('contracts.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{previewContract?.title}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {previewContract && (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: previewContract.content }}
              />
            )}
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              {t('common.close')}
            </Button>
            {previewContract && (
              <Button
                onClick={() => handleExportPdf(previewContract)}
                disabled={exporting === previewContract.id}
                className="gap-2"
              >
                {exporting === previewContract.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {t('contracts.exportPdf')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingContract} onOpenChange={() => setDeletingContract(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('contracts.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('contracts.deleteConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
