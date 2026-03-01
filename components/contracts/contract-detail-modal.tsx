"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/language-context"
import { ContractType, Quote, ProjectContract, ProjectDocument } from "@/lib/types"
import { ContractProfileInput } from "@/lib/contracts"
import { CalculatedQuoteData } from "@/lib/quote-calculations"
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
import { Loader2, Info } from "lucide-react"
import { ContractFormCommon } from "@/components/contracts/contract-form-common"
import { ContractFormService } from "@/components/contracts/contract-form-service"
import { ContractFormMaterials } from "@/components/contracts/contract-form-materials"

interface ContractDetailModalProps {
  // Create/Edit dialog
  showCreateDialog: boolean
  onShowCreateDialogChange: (open: boolean) => void
  editingContract: ProjectContract | null
  saving: boolean
  onSave: () => void

  // Form state
  formType: ContractType
  formTitle: string
  formQuoteId: string
  formContent: string
  formValidUntil: string
  onFormTypeChange: (type: ContractType) => void
  onFormTitleChange: (title: string) => void
  onFormQuoteIdChange: (id: string) => void
  onFormContentChange: (content: string) => void
  onFormValidUntilChange: (date: string) => void

  // Quote data
  quotes: Quote[]
  selectedQuote: Quote | null
  quoteData: CalculatedQuoteData | null

  // Fixed-price fields
  formDeliveryDelay: string
  formPaymentSchedule: string
  onFormDeliveryDelayChange: (delay: string) => void
  onFormPaymentScheduleChange: (schedule: string) => void

  // Annexes
  formSignedQuoteId: string
  formSpecificationId: string
  formPlanningId: string
  signedQuoteDocuments: ProjectDocument[]
  specificationDocuments: ProjectDocument[]
  planningDocuments: ProjectDocument[]
  onFormSignedQuoteIdChange: (id: string) => void
  onFormSpecificationIdChange: (id: string) => void
  onFormPlanningIdChange: (id: string) => void

  // Time and materials fields
  formProfiles: ContractProfileInput[]
  formWorkLocation: string
  formContractDuration: string
  formNoticePeriod: string
  formBillingFrequency: string
  hasValidProfiles: boolean
  profilesTotalEstimate: number
  profilesTotalDays: number
  onAddProfile: () => void
  onRemoveProfile: (index: number) => void
  onUpdateProfile: (index: number, field: keyof ContractProfileInput, value: string | number | null) => void
  onFormWorkLocationChange: (location: string) => void
  onFormContractDurationChange: (duration: string) => void
  onFormNoticePeriodChange: (period: string) => void
  onFormBillingFrequencyChange: (frequency: string) => void

  // Delete dialog
  deletingContract: ProjectContract | null
  onSetDeletingContract: (contract: ProjectContract | null) => void
  onDelete: () => void
}

export function ContractDetailModal({
  showCreateDialog,
  onShowCreateDialogChange,
  editingContract,
  saving,
  onSave,
  formType,
  formTitle,
  formQuoteId,
  formContent,
  formValidUntil,
  onFormTypeChange,
  onFormTitleChange,
  onFormQuoteIdChange,
  onFormContentChange,
  onFormValidUntilChange,
  quotes,
  selectedQuote,
  quoteData,
  formDeliveryDelay,
  formPaymentSchedule,
  onFormDeliveryDelayChange,
  onFormPaymentScheduleChange,
  formSignedQuoteId,
  formSpecificationId,
  formPlanningId,
  signedQuoteDocuments,
  specificationDocuments,
  planningDocuments,
  onFormSignedQuoteIdChange,
  onFormSpecificationIdChange,
  onFormPlanningIdChange,
  formProfiles,
  formWorkLocation,
  formContractDuration,
  formNoticePeriod,
  formBillingFrequency,
  hasValidProfiles,
  profilesTotalEstimate,
  profilesTotalDays,
  onAddProfile,
  onRemoveProfile,
  onUpdateProfile,
  onFormWorkLocationChange,
  onFormContractDurationChange,
  onFormNoticePeriodChange,
  onFormBillingFrequencyChange,
  deletingContract,
  onSetDeletingContract,
  onDelete,
}: ContractDetailModalProps) {
  const { t } = useLanguage()

  return (
    <>
      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={onShowCreateDialogChange}>
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
              selectedQuote={selectedQuote}
              quoteData={quoteData}
              onTypeChange={onFormTypeChange}
              onTitleChange={onFormTitleChange}
              onQuoteIdChange={onFormQuoteIdChange}
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
                onDeliveryDelayChange={onFormDeliveryDelayChange}
                onPaymentScheduleChange={onFormPaymentScheduleChange}
                onSignedQuoteIdChange={onFormSignedQuoteIdChange}
                onSpecificationIdChange={onFormSpecificationIdChange}
                onPlanningIdChange={onFormPlanningIdChange}
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
                onAddProfile={onAddProfile}
                onRemoveProfile={onRemoveProfile}
                onUpdateProfile={onUpdateProfile}
                onWorkLocationChange={onFormWorkLocationChange}
                onContractDurationChange={onFormContractDurationChange}
                onNoticePeriodChange={onFormNoticePeriodChange}
                onBillingFrequencyChange={onFormBillingFrequencyChange}
              />
            )}

            {/* Special conditions (optional) */}
            <div className="space-y-2">
              <Label>{t('contracts.specialConditions')}</Label>
              <Textarea
                placeholder={t('contracts.specialConditionsPlaceholder')}
                value={formContent}
                onChange={(e) => onFormContentChange(e.target.value)}
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
                onChange={(e) => onFormValidUntilChange(e.target.value)}
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
            <Button variant="outline" onClick={() => onShowCreateDialogChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={onSave}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingContract} onOpenChange={() => onSetDeletingContract(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('contracts.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('contracts.deleteConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
