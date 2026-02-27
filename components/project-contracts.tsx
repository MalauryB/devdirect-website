"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { Project, Quote, ProjectContract, ContractType, ContractStatus, Profile, ProjectDocument } from "@/lib/types"
import {
  getProjectContracts,
  createContract,
  updateContract,
  updateContractStatus,
  deleteContract,
  ContractProfileInput
} from "@/lib/contracts"
import { generateContractPdfUrl, downloadContractPdf } from "@/lib/contract-pdf-export"
import { calculateQuoteData } from "@/lib/quote-export"
import { getProjectDocuments } from "@/lib/documents"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
  FileSignature,
  Info,
} from "lucide-react"

import { ContractListItem } from "@/components/contracts/contract-list-item"
import { ContractFormCommon } from "@/components/contracts/contract-form-common"
import { ContractFormService } from "@/components/contracts/contract-form-service"
import { ContractFormMaterials } from "@/components/contracts/contract-form-materials"
import { ContractPreviewDialog } from "@/components/contracts/contract-preview-dialog"

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

export function ProjectContracts({ project, quotes, client, isEngineer, provider }: ProjectContractsProps) {
  const { t } = useLanguage()
  const { session } = useAuth()
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
  // Annexes document selection (for forfait contracts)
  const [formSignedQuoteId, setFormSignedQuoteId] = useState<string>('none')
  const [formSpecificationId, setFormSpecificationId] = useState<string>('none')
  const [formPlanningId, setFormPlanningId] = useState<string>('none')

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

  // Get documents by type for annexes selection
  const signedQuoteDocuments = projectDocuments.filter(d => d.type === 'signed_quote')
  const specificationDocuments = projectDocuments.filter(d => d.type === 'specification')
  const planningDocuments = projectDocuments.filter(d => d.type === 'planning')

  // Get selected documents for PDF generation
  const selectedSignedQuote = formSignedQuoteId !== 'none'
    ? projectDocuments.find(d => d.id === formSignedQuoteId) || null
    : null
  const selectedSpecification = formSpecificationId !== 'none'
    ? projectDocuments.find(d => d.id === formSpecificationId) || null
    : null
  const selectedPlanning = formPlanningId !== 'none'
    ? projectDocuments.find(d => d.id === formPlanningId) || null
    : null

  const resetForm = () => {
    setFormType('service_agreement')
    setFormQuoteId('none')
    setFormTitle('')
    setFormContent('')
    setFormValidUntil('')
    // Fixed-price
    setFormDeliveryDelay('3_months')
    setFormPaymentSchedule('30-40-30')
    // Annexes
    setFormSignedQuoteId('none')
    setFormSpecificationId('none')
    setFormPlanningId('none')
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
      // Use latest documents by default for preview
      const latestSignedQuote = signedQuoteDocuments.length > 0 ? signedQuoteDocuments[0] : null
      const latestSpecification = specificationDocuments.length > 0 ? specificationDocuments[0] : null
      const latestPlanning = planningDocuments.length > 0 ? planningDocuments[0] : null

      const url = await generateContractPdfUrl({
        contract,
        project,
        client: client || project.profiles as Profile | undefined,
        quote: contractQuote,
        provider,
        includeAnnexes: true,
        signedQuoteDocument: latestSignedQuote,
        specificationDocument: latestSpecification,
        planningDocument: latestPlanning,
        accessToken: session?.access_token,
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
      // Use latest documents by default for export
      const latestSignedQuote = signedQuoteDocuments.length > 0 ? signedQuoteDocuments[0] : null
      const latestSpecification = specificationDocuments.length > 0 ? specificationDocuments[0] : null
      const latestPlanning = planningDocuments.length > 0 ? planningDocuments[0] : null

      const url = await generateContractPdfUrl({
        contract,
        project,
        client: client || project.profiles as Profile | undefined,
        quote: contractQuote,
        provider,
        includeAnnexes: true,
        signedQuoteDocument: latestSignedQuote,
        specificationDocument: latestSpecification,
        planningDocument: latestPlanning,
        accessToken: session?.access_token,
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
        <div className="text-center py-12 bg-muted/50 rounded-xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
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
          {contracts.map((contract) => (
            <ContractListItem
              key={contract.id}
              contract={contract}
              isEngineer={isEngineer}
              exporting={exporting}
              onPreview={handlePreview}
              onExport={handleExportPdf}
              onEdit={handleOpenEdit}
              onDelete={setDeletingContract}
              onStatusChange={handleStatusChange}
              formatDate={formatDate}
            />
          ))}
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
            <ContractFormCommon
              formType={formType}
              formTitle={formTitle}
              formQuoteId={formQuoteId}
              quotes={quotes}
              selectedQuote={selectedQuote || null}
              quoteData={quoteData}
              onTypeChange={setFormType}
              onTitleChange={setFormTitle}
              onQuoteIdChange={setFormQuoteId}
            />

            {/* Fixed-price specific fields */}
            {formType === 'service_agreement' && (
              <ContractFormService
                formDeliveryDelay={formDeliveryDelay}
                formPaymentSchedule={formPaymentSchedule}
                formSignedQuoteId={formSignedQuoteId}
                formSpecificationId={formSpecificationId}
                formPlanningId={formPlanningId}
                signedQuoteDocuments={signedQuoteDocuments}
                specificationDocuments={specificationDocuments}
                planningDocuments={planningDocuments}
                onDeliveryDelayChange={setFormDeliveryDelay}
                onPaymentScheduleChange={setFormPaymentSchedule}
                onSignedQuoteIdChange={setFormSignedQuoteId}
                onSpecificationIdChange={setFormSpecificationId}
                onPlanningIdChange={setFormPlanningId}
              />
            )}

            {/* Time and materials specific fields */}
            {formType === 'time_and_materials' && (
              <ContractFormMaterials
                formProfiles={formProfiles}
                formWorkLocation={formWorkLocation}
                formContractDuration={formContractDuration}
                formNoticePeriod={formNoticePeriod}
                formBillingFrequency={formBillingFrequency}
                hasValidProfiles={hasValidProfiles}
                profilesTotalEstimate={profilesTotalEstimate}
                profilesTotalDays={profilesTotalDays}
                onAddProfile={addProfile}
                onRemoveProfile={removeProfile}
                onUpdateProfile={updateProfile}
                onWorkLocationChange={setFormWorkLocation}
                onContractDurationChange={setFormContractDuration}
                onNoticePeriodChange={setFormNoticePeriod}
                onBillingFrequencyChange={setFormBillingFrequency}
              />
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
      <ContractPreviewDialog
        showPreviewDialog={showPreviewDialog}
        previewPdfUrl={previewPdfUrl}
        previewLoading={previewLoading}
        previewTitle={previewContract?.title}
        onClose={handleClosePreview}
        onDownload={handleDownloadFromPreview}
      />

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
