"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/language-context"
import { Project, Quote, ProjectContract, ContractType, ContractStatus, Profile, ContractProfile, ProjectDocument } from "@/lib/types"
import {
  getProjectContracts,
  createContract,
  updateContract,
  updateContractStatus,
  deleteContract,
  getContractTypeLabel,
  getContractStatusLabel,
  ContractProfileInput
} from "@/lib/contracts"
import { generateContractPdfUrl, downloadContractPdf } from "@/lib/contract-pdf-export"
import { calculateQuoteData } from "@/lib/quote-export"
import { getProjectDocuments } from "@/lib/documents"
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
  Info,
  X,
  Users,
  Undo2
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
  time_and_materials: <FileSignature className="w-4 h-4" />,
  terms_of_sale: <FileCheck className="w-4 h-4" />,
  amendment: <FilePlus2 className="w-4 h-4" />
}

export function ProjectContracts({ project, quotes, client, isEngineer, provider }: ProjectContractsProps) {
  const { t } = useLanguage()
  const [contracts, setContracts] = useState<ProjectContract[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [previewContract, setPreviewContract] = useState<ProjectContract | null>(null)
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [editingContract, setEditingContract] = useState<ProjectContract | null>(null)
  const [deletingContract, setDeletingContract] = useState<ProjectContract | null>(null)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)
  const [projectDocuments, setProjectDocuments] = useState<ProjectDocument[]>([])

  // Form state
  const [formType, setFormType] = useState<ContractType>('service_agreement')
  const [formQuoteId, setFormQuoteId] = useState<string>('none')
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('') // Special conditions/notes
  const [formValidUntil, setFormValidUntil] = useState('')
  // Fixed-price specific
  const [formDeliveryDelay, setFormDeliveryDelay] = useState<string>('3_months') // Delivery delay
  const [formPaymentSchedule, setFormPaymentSchedule] = useState<string>('30-40-30') // Payment schedule
  // Time and materials specific - Multiple profiles
  const [formProfiles, setFormProfiles] = useState<ContractProfileInput[]>([
    { profile_name: '', daily_rate: 0, estimated_days: null }
  ])
  const [formWorkLocation, setFormWorkLocation] = useState<string>('remote')
  const [formContractDuration, setFormContractDuration] = useState<string>('6_months')
  const [formNoticePeriod, setFormNoticePeriod] = useState<string>('1_month')
  const [formBillingFrequency, setFormBillingFrequency] = useState<string>('monthly')

  // Get selected quote data for preview
  const selectedQuote = formQuoteId && formQuoteId !== 'none' ? quotes.find(q => q.id === formQuoteId) : null
  const quoteData = selectedQuote ? calculateQuoteData(selectedQuote) : null

  // Load contracts and documents
  useEffect(() => {
    loadContracts()
    loadDocuments()
  }, [project.id])

  const loadContracts = async () => {
    setLoading(true)
    const data = await getProjectContracts(project.id)
    setContracts(data)
    setLoading(false)
  }

  const loadDocuments = async () => {
    const { documents } = await getProjectDocuments(project.id)
    setProjectDocuments(documents)
  }

  // Get documents for annexes
  const signedQuoteDocument = projectDocuments.find(d => d.type === 'signed_quote') || null
  const specificationDocument = projectDocuments.find(d => d.type === 'specification') || null
  const planningDocument = projectDocuments.find(d => d.type === 'planning') || null

  const resetForm = () => {
    setFormType('service_agreement')
    setFormQuoteId('none')
    setFormTitle('')
    setFormContent('')
    setFormValidUntil('')
    // Fixed-price
    setFormDeliveryDelay('3_months')
    setFormPaymentSchedule('30-40-30')
    // Time and materials - reset to single empty profile
    setFormProfiles([{ profile_name: '', daily_rate: 0, estimated_days: null }])
    setFormWorkLocation('remote')
    setFormContractDuration('6_months')
    setFormNoticePeriod('1_month')
    setFormBillingFrequency('monthly')
    setEditingContract(null)
  }

  // Helper functions for managing profiles
  const addProfile = () => {
    setFormProfiles([...formProfiles, { profile_name: '', daily_rate: 0, estimated_days: null }])
  }

  const removeProfile = (index: number) => {
    if (formProfiles.length > 1) {
      setFormProfiles(formProfiles.filter((_, i) => i !== index))
    }
  }

  const updateProfile = (index: number, field: keyof ContractProfileInput, value: string | number | null) => {
    const newProfiles = [...formProfiles]
    if (field === 'profile_name') {
      newProfiles[index].profile_name = value as string
    } else if (field === 'daily_rate') {
      newProfiles[index].daily_rate = value as number
    } else if (field === 'estimated_days') {
      newProfiles[index].estimated_days = value as number | null
    }
    setFormProfiles(newProfiles)
  }

  // Calculate totals for profiles
  const profilesTotalEstimate = formProfiles.reduce((sum, p) => {
    if (p.daily_rate && p.estimated_days) {
      return sum + (p.daily_rate * p.estimated_days)
    }
    return sum
  }, 0)

  const profilesTotalDays = formProfiles.reduce((sum, p) => sum + (p.estimated_days || 0), 0)

  // Auto-generate title when type changes
  useEffect(() => {
    if (!editingContract && (selectedQuote || formType === 'time_and_materials')) {
      const typeLabel = formType === 'service_agreement' ? 'Contrat de prestation au forfait' :
        formType === 'time_and_materials' ? 'Contrat de prestation en régie' :
        formType === 'terms_of_sale' ? 'CGV' : 'Avenant'
      setFormTitle(`${typeLabel} - ${project.title}`)
    }
  }, [selectedQuote, formType, project.title, editingContract])

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
    // Fixed-price
    setFormDeliveryDelay(contract.delivery_delay || '3_months')
    setFormPaymentSchedule(contract.payment_schedule || '30-40-30')
    // Time and materials - Load profiles
    if (contract.profiles && contract.profiles.length > 0) {
      setFormProfiles(contract.profiles.map(p => ({
        profile_name: p.profile_name,
        daily_rate: p.daily_rate,
        estimated_days: p.estimated_days
      })))
    } else {
      setFormProfiles([{ profile_name: '', daily_rate: 0, estimated_days: null }])
    }
    setFormWorkLocation(contract.work_location || 'remote')
    setFormContractDuration(contract.contract_duration || '6_months')
    setFormNoticePeriod(contract.notice_period || '1_month')
    setFormBillingFrequency(contract.billing_frequency || 'monthly')
    setEditingContract(contract)
    setShowCreateDialog(true)
  }

  const handlePreview = async (contract: ProjectContract) => {
    setPreviewContract(contract)
    setPreviewPdfUrl(null)
    setPreviewLoading(true)
    setShowPreviewDialog(true)

    try {
      const contractQuote = contract.quote_id ? quotes.find(q => q.id === contract.quote_id) : null
      const url = await generateContractPdfUrl({
        contract,
        project,
        client: client || project.profiles as Profile | undefined,
        quote: contractQuote,
        provider,
        includeAnnexes: true,
        signedQuoteDocument,
        specificationDocument,
        planningDocument
      })
      setPreviewPdfUrl(url)
    } catch (error) {
      console.error('Error generating PDF preview:', error)
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleClosePreview = () => {
    setShowPreviewDialog(false)
    // Clean up blob URL
    if (previewPdfUrl) {
      window.URL.revokeObjectURL(previewPdfUrl)
      setPreviewPdfUrl(null)
    }
    setPreviewContract(null)
  }

  const handleDownloadFromPreview = () => {
    if (previewPdfUrl && previewContract) {
      downloadContractPdf(previewPdfUrl, previewContract.id)
    }
  }

  // Validate profiles - at least one with name and daily_rate
  const hasValidProfiles = formProfiles.some(p => p.profile_name.trim() && p.daily_rate > 0)

  const handleSave = async () => {
    if (!formTitle.trim()) return
    // For service agreements, quote is required
    if (formType === 'service_agreement' && formQuoteId === 'none') return
    // For time and materials, at least one valid profile is required
    if (formType === 'time_and_materials' && !hasValidProfiles) return

    setSaving(true)

    // Filter valid profiles (with name and daily_rate)
    const validProfiles = formProfiles.filter(p => p.profile_name.trim() && p.daily_rate > 0)

    if (editingContract) {
      const updateData: Parameters<typeof updateContract>[1] = {
        title: formTitle,
        content: formContent,
        type: formType,
        valid_until: formValidUntil || undefined,
      }

      // Add type-specific fields
      if (formType === 'service_agreement') {
        updateData.delivery_delay = formDeliveryDelay
        updateData.payment_schedule = formPaymentSchedule
      } else if (formType === 'time_and_materials') {
        updateData.profiles = validProfiles
        updateData.work_location = formWorkLocation
        updateData.contract_duration = formContractDuration
        updateData.notice_period = formNoticePeriod
        updateData.billing_frequency = formBillingFrequency
      }

      const updated = await updateContract(editingContract.id, updateData)

      if (updated) {
        await loadContracts()
        setShowCreateDialog(false)
        resetForm()
      }
    } else {
      const createData: Parameters<typeof createContract>[0] = {
        project_id: project.id,
        quote_id: formQuoteId && formQuoteId !== 'none' ? formQuoteId : undefined,
        type: formType,
        title: formTitle,
        content: formContent,
        valid_until: formValidUntil || undefined,
      }

      // Add type-specific fields
      if (formType === 'service_agreement') {
        createData.delivery_delay = formDeliveryDelay
        createData.payment_schedule = formPaymentSchedule
      } else if (formType === 'time_and_materials') {
        createData.profiles = validProfiles
        createData.work_location = formWorkLocation
        createData.contract_duration = formContractDuration
        createData.notice_period = formNoticePeriod
        createData.billing_frequency = formBillingFrequency
      }

      const created = await createContract(createData)

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
      // Find the quote associated with this contract
      const contractQuote = contract.quote_id ? quotes.find(q => q.id === contract.quote_id) : null
      const url = await generateContractPdfUrl({
        contract,
        project,
        client: client || project.profiles as Profile | undefined,
        quote: contractQuote,
        provider,
        includeAnnexes: true,
        signedQuoteDocument,
        specificationDocument,
        planningDocument
      })
      downloadContractPdf(url, contract.id)
      window.URL.revokeObjectURL(url)
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
            // Check if T&M contract is missing required profiles
            const isIncomplete = contract.type === 'time_and_materials' &&
              (!contract.profiles || contract.profiles.length === 0 ||
               !contract.profiles.some(p => p.profile_name && p.daily_rate > 0))

            return (
              <div
                key={contract.id}
                className={`bg-white border rounded-xl p-4 hover:border-gray-300 transition-colors ${isIncomplete ? 'border-amber-300 bg-amber-50/30' : 'border-gray-200'}`}
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
                          {contract.status === 'signed' && (
                            <>
                              <DropdownMenuItem onClick={() => handleStatusChange(contract, 'sent')}>
                                <Undo2 className="w-3 h-3 mr-2" />
                                {t('contracts.unsign')}
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
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingContract ? t('contracts.edit') : t('contracts.create')}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-5 py-4 pr-2">
            {/* Contract type */}
            <div className="space-y-2">
              <Label>{t('contracts.type')}</Label>
              <Select value={formType} onValueChange={(v) => setFormType(v as ContractType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service_agreement">{t('contracts.types.serviceAgreement')}</SelectItem>
                  <SelectItem value="time_and_materials">{t('contracts.types.timeAndMaterials')}</SelectItem>
                  <SelectItem value="terms_of_sale">{t('contracts.types.termsOfSale')}</SelectItem>
                  <SelectItem value="amendment">{t('contracts.types.amendment')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Time and materials notice */}
            {formType === 'time_and_materials' && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{t('contracts.obligationNote')}</p>
                  <p className="text-xs mt-1 text-amber-600">{t('contracts.obligationNoteDesc')}</p>
                </div>
              </div>
            )}

            {/* Link to quote - required for service agreements (forfait) */}
            {formType === 'service_agreement' && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  {t('contracts.linkedQuote')}
                  <span className="text-xs text-red-500">*</span>
                </Label>
                {quotes.length > 0 ? (
                  <Select value={formQuoteId} onValueChange={setFormQuoteId}>
                    <SelectTrigger className={formQuoteId === 'none' ? 'border-red-300' : ''}>
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
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{t('contracts.noQuotesAvailable')}</span>
                  </div>
                )}
                {formQuoteId === 'none' && quotes.length > 0 && (
                  <p className="text-xs text-red-500">{t('contracts.quoteRequired')}</p>
                )}
              </div>
            )}

            {/* Quote summary when selected (forfait only) */}
            {formType === 'service_agreement' && selectedQuote && quoteData && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Info className="w-4 h-4 text-blue-500" />
                  {t('contracts.quoteSummary')}
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-foreground/50 text-xs">{t('contracts.totalHT')}</p>
                    <p className="font-semibold">{quoteData.totalHT.toLocaleString('fr-FR')} €</p>
                  </div>
                  <div>
                    <p className="text-foreground/50 text-xs">{t('contracts.tva')}</p>
                    <p className="font-semibold">{quoteData.totalTVA.toLocaleString('fr-FR')} €</p>
                  </div>
                  <div>
                    <p className="text-foreground/50 text-xs">{t('contracts.totalTTC')}</p>
                    <p className="font-semibold text-action">{quoteData.totalTTC.toLocaleString('fr-FR')} €</p>
                  </div>
                </div>
                <div className="text-xs text-foreground/50">
                  {t('contracts.totalDays')}: {quoteData.totalDays.toFixed(1)} {t('contracts.days')}
                </div>
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

            {/* Fixed-price specific fields */}
            {formType === 'service_agreement' && (
              <>
                {/* Delivery delay */}
                <div className="space-y-2">
                  <Label>{t('contracts.deliveryDelay')}</Label>
                  <Select value={formDeliveryDelay} onValueChange={setFormDeliveryDelay}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1_month">{t('contracts.delays.1month')}</SelectItem>
                      <SelectItem value="2_months">{t('contracts.delays.2months')}</SelectItem>
                      <SelectItem value="3_months">{t('contracts.delays.3months')}</SelectItem>
                      <SelectItem value="6_months">{t('contracts.delays.6months')}</SelectItem>
                      <SelectItem value="custom">{t('contracts.delays.custom')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment schedule */}
                <div className="space-y-2">
                  <Label>{t('contracts.paymentSchedule')}</Label>
                  <Select value={formPaymentSchedule} onValueChange={setFormPaymentSchedule}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30-40-30">{t('contracts.schedules.30-40-30')}</SelectItem>
                      <SelectItem value="50-50">{t('contracts.schedules.50-50')}</SelectItem>
                      <SelectItem value="30-70">{t('contracts.schedules.30-70')}</SelectItem>
                      <SelectItem value="100">{t('contracts.schedules.100')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-foreground/50">{t('contracts.paymentScheduleHint')}</p>
                </div>
              </>
            )}

            {/* Time and materials specific fields */}
            {formType === 'time_and_materials' && (
              <>
                {/* Profiles section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {t('contracts.profiles')}
                      <span className="text-xs text-red-500">*</span>
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addProfile}
                      className="h-7 text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {t('contracts.addProfile')}
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {formProfiles.map((profile, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-foreground/60">
                            {t('contracts.profileNumber')} {index + 1}
                          </span>
                          {formProfiles.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProfile(index)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          {/* Profile name */}
                          <div className="col-span-3 sm:col-span-1">
                            <Input
                              placeholder={t('contracts.profileNamePlaceholder')}
                              value={profile.profile_name}
                              onChange={(e) => updateProfile(index, 'profile_name', e.target.value)}
                              className={!profile.profile_name.trim() ? 'border-red-300' : ''}
                            />
                          </div>

                          {/* Daily rate */}
                          <div className="relative">
                            <Input
                              type="number"
                              min="0"
                              step="10"
                              placeholder="500"
                              value={profile.daily_rate || ''}
                              onChange={(e) => updateProfile(index, 'daily_rate', Number(e.target.value))}
                              className={!profile.daily_rate ? 'border-red-300 pr-16' : 'pr-16'}
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-foreground/50">€/jour</span>
                          </div>

                          {/* Estimated days */}
                          <div className="relative">
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              placeholder="20"
                              value={profile.estimated_days || ''}
                              onChange={(e) => updateProfile(index, 'estimated_days', e.target.value ? Number(e.target.value) : null)}
                              className="pr-12"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-foreground/50">jours</span>
                          </div>
                        </div>

                        {/* Profile subtotal */}
                        {profile.daily_rate > 0 && profile.estimated_days && profile.estimated_days > 0 && (
                          <div className="text-xs text-foreground/60 text-right">
                            Sous-total: {(profile.daily_rate * profile.estimated_days).toLocaleString('fr-FR')} € HT
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {!hasValidProfiles && (
                    <p className="text-xs text-red-500">{t('contracts.profileRequired')}</p>
                  )}
                </div>

                {/* Estimated total preview */}
                {profilesTotalEstimate > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                    <p className="text-sm font-medium text-foreground">{t('contracts.estimatedTotal')}</p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-foreground/50 text-xs">{t('contracts.totalDays')}</p>
                        <p className="font-semibold">{profilesTotalDays} {t('contracts.days')}</p>
                      </div>
                      <div>
                        <p className="text-foreground/50 text-xs">{t('contracts.totalHT')}</p>
                        <p className="font-semibold">{profilesTotalEstimate.toLocaleString('fr-FR')} €</p>
                      </div>
                      <div>
                        <p className="text-foreground/50 text-xs">{t('contracts.totalTTC')}</p>
                        <p className="font-semibold text-action">{(profilesTotalEstimate * 1.2).toLocaleString('fr-FR')} €</p>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/40 italic">* {t('contracts.estimatedTotalHint')}</p>
                  </div>
                )}

                {/* Work location */}
                <div className="space-y-2">
                  <Label>{t('contracts.workLocation')}</Label>
                  <Select value={formWorkLocation} onValueChange={setFormWorkLocation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">{t('contracts.workLocations.client')}</SelectItem>
                      <SelectItem value="remote">{t('contracts.workLocations.remote')}</SelectItem>
                      <SelectItem value="hybrid">{t('contracts.workLocations.hybrid')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Contract duration */}
                <div className="space-y-2">
                  <Label>{t('contracts.contractDuration')}</Label>
                  <Select value={formContractDuration} onValueChange={setFormContractDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3_months">{t('contracts.durations.3months')}</SelectItem>
                      <SelectItem value="6_months">{t('contracts.durations.6months')}</SelectItem>
                      <SelectItem value="12_months">{t('contracts.durations.12months')}</SelectItem>
                      <SelectItem value="custom">{t('contracts.durations.custom')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notice period */}
                <div className="space-y-2">
                  <Label>{t('contracts.noticePeriod')}</Label>
                  <Select value={formNoticePeriod} onValueChange={setFormNoticePeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15_days">{t('contracts.noticePeriods.15days')}</SelectItem>
                      <SelectItem value="1_month">{t('contracts.noticePeriods.1month')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Billing frequency */}
                <div className="space-y-2">
                  <Label>{t('contracts.billingFrequency')}</Label>
                  <Select value={formBillingFrequency} onValueChange={setFormBillingFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">{t('contracts.billingFrequencies.weekly')}</SelectItem>
                      <SelectItem value="monthly">{t('contracts.billingFrequencies.monthly')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Special conditions (optional) */}
            <div className="space-y-2">
              <Label>{t('contracts.specialConditions')}</Label>
              <Textarea
                placeholder={t('contracts.specialConditionsPlaceholder')}
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                rows={4}
                className="text-sm"
              />
              <p className="text-xs text-foreground/50">
                {t('contracts.specialConditionsHint')}
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

            {/* Info box about PDF generation */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{t('contracts.pdfInfo')}</p>
                <p className="text-xs mt-1 text-blue-600">
                  {formType === 'time_and_materials'
                    ? t('contracts.pdfInfoDetailsRegie')
                    : t('contracts.pdfInfoDetails')
                  }
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                saving ||
                !formTitle.trim() ||
                (formType === 'service_agreement' && formQuoteId === 'none') ||
                (formType === 'time_and_materials' && !hasValidProfiles)
              }
              className="bg-action hover:bg-action/90 text-white"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editingContract ? t('common.save') : t('contracts.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog with PDF */}
      <Dialog open={showPreviewDialog} onOpenChange={handleClosePreview}>
        <DialogContent className="sm:max-w-[900px] h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-3">
              <FileText className="w-5 h-5" />
              {previewContract?.title || t('contracts.previewTitle')}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden bg-gray-100">
            {previewLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-action" />
                <p className="text-sm text-foreground/60">{t('contracts.generatingPdf')}</p>
              </div>
            ) : previewPdfUrl ? (
              <iframe
                src={previewPdfUrl}
                className="w-full h-full border-0"
                title={previewContract?.title || 'Contract PDF'}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <p className="text-sm text-foreground/60">{t('contracts.pdfError')}</p>
              </div>
            )}
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-white">
            <Button variant="outline" onClick={handleClosePreview}>
              {t('common.close')}
            </Button>
            {previewPdfUrl && previewContract && (
              <Button
                onClick={handleDownloadFromPreview}
                className="gap-2 bg-action hover:bg-action/90 text-white"
              >
                <Download className="w-4 h-4" />
                {t('contracts.downloadPdf')}
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
