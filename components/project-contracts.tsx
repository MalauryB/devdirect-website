"use client"

import { useState, useEffect, memo } from "react"
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
import { Loader2 } from "lucide-react"

import { ContractList } from "@/components/contracts/contract-list"
import { ContractDetailModal } from "@/components/contracts/contract-detail-modal"
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

export const ProjectContracts = memo(function ProjectContracts({ project, quotes, client, isEngineer, provider }: ProjectContractsProps) {
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
  const [formContent, setFormContent] = useState('')
  const [formValidUntil, setFormValidUntil] = useState('')
  // Fixed-price specific
  const [formDeliveryDelay, setFormDeliveryDelay] = useState<string>('3_months')
  const [formPaymentSchedule, setFormPaymentSchedule] = useState<string>('30-40-30')
  // Time and materials specific
  const [formProfiles, setFormProfiles] = useState<ContractProfileInput[]>([
    { profile_name: '', daily_rate: 0, estimated_days: null }
  ])
  const [formWorkLocation, setFormWorkLocation] = useState<string>('remote')
  const [formContractDuration, setFormContractDuration] = useState<string>('6_months')
  const [formNoticePeriod, setFormNoticePeriod] = useState<string>('1_month')
  const [formBillingFrequency, setFormBillingFrequency] = useState<string>('monthly')
  // Annexes document selection
  const [formSignedQuoteId, setFormSignedQuoteId] = useState<string>('none')
  const [formSpecificationId, setFormSpecificationId] = useState<string>('none')
  const [formPlanningId, setFormPlanningId] = useState<string>('none')

  // Get selected quote data
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

  // Get documents by type
  const signedQuoteDocuments = projectDocuments.filter(d => d.type === 'signed_quote')
  const specificationDocuments = projectDocuments.filter(d => d.type === 'specification')
  const planningDocuments = projectDocuments.filter(d => d.type === 'planning')

  const resetForm = () => {
    setFormType('service_agreement')
    setFormQuoteId('none')
    setFormTitle('')
    setFormContent('')
    setFormValidUntil('')
    setFormDeliveryDelay('3_months')
    setFormPaymentSchedule('30-40-30')
    setFormSignedQuoteId('none')
    setFormSpecificationId('none')
    setFormPlanningId('none')
    setFormProfiles([{ profile_name: '', daily_rate: 0, estimated_days: null }])
    setFormWorkLocation('remote')
    setFormContractDuration('6_months')
    setFormNoticePeriod('1_month')
    setFormBillingFrequency('monthly')
    setEditingContract(null)
  }

  // Profile helpers
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

  const profilesTotalEstimate = formProfiles.reduce((sum, p) => {
    if (p.daily_rate && p.estimated_days) return sum + (p.daily_rate * p.estimated_days)
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
    setFormDeliveryDelay(contract.delivery_delay || '3_months')
    setFormPaymentSchedule(contract.payment_schedule || '30-40-30')
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

  const hasValidProfiles = formProfiles.some(p => p.profile_name.trim() && p.daily_rate > 0)

  const handleSave = async () => {
    if (!formTitle.trim()) return
    if (formType === 'service_agreement' && formQuoteId === 'none') return
    if (formType === 'time_and_materials' && !hasValidProfiles) return

    setSaving(true)
    const validProfiles = formProfiles.filter(p => p.profile_name.trim() && p.daily_rate > 0)

    if (editingContract) {
      const updateData: Parameters<typeof updateContract>[1] = {
        title: formTitle,
        content: formContent,
        type: formType,
        valid_until: formValidUntil || undefined,
      }
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
      const contractQuote = contract.quote_id ? quotes.find(q => q.id === contract.quote_id) : null
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
      <ContractList
        contracts={contracts}
        isEngineer={isEngineer}
        exporting={exporting}
        onOpenCreate={handleOpenCreate}
        onPreview={handlePreview}
        onExport={handleExportPdf}
        onEdit={handleOpenEdit}
        onDelete={setDeletingContract}
        onStatusChange={handleStatusChange}
        formatDate={formatDate}
      />

      <ContractDetailModal
        showCreateDialog={showCreateDialog}
        onShowCreateDialogChange={setShowCreateDialog}
        editingContract={editingContract}
        saving={saving}
        onSave={handleSave}
        formType={formType}
        formTitle={formTitle}
        formQuoteId={formQuoteId}
        formContent={formContent}
        formValidUntil={formValidUntil}
        onFormTypeChange={setFormType}
        onFormTitleChange={setFormTitle}
        onFormQuoteIdChange={setFormQuoteId}
        onFormContentChange={setFormContent}
        onFormValidUntilChange={setFormValidUntil}
        quotes={quotes}
        selectedQuote={selectedQuote || null}
        quoteData={quoteData}
        formDeliveryDelay={formDeliveryDelay}
        formPaymentSchedule={formPaymentSchedule}
        onFormDeliveryDelayChange={setFormDeliveryDelay}
        onFormPaymentScheduleChange={setFormPaymentSchedule}
        formSignedQuoteId={formSignedQuoteId}
        formSpecificationId={formSpecificationId}
        formPlanningId={formPlanningId}
        signedQuoteDocuments={signedQuoteDocuments}
        specificationDocuments={specificationDocuments}
        planningDocuments={planningDocuments}
        onFormSignedQuoteIdChange={setFormSignedQuoteId}
        onFormSpecificationIdChange={setFormSpecificationId}
        onFormPlanningIdChange={setFormPlanningId}
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
        onFormWorkLocationChange={setFormWorkLocation}
        onFormContractDurationChange={setFormContractDuration}
        onFormNoticePeriodChange={setFormNoticePeriod}
        onFormBillingFrequencyChange={setFormBillingFrequency}
        deletingContract={deletingContract}
        onSetDeletingContract={setDeletingContract}
        onDelete={handleDelete}
      />

      {/* Preview Dialog with PDF */}
      <ContractPreviewDialog
        showPreviewDialog={showPreviewDialog}
        previewPdfUrl={previewPdfUrl}
        previewLoading={previewLoading}
        previewTitle={previewContract?.title}
        onClose={handleClosePreview}
        onDownload={handleDownloadFromPreview}
      />
    </div>
  )
})
