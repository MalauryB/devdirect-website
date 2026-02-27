"use client"

import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/language-context"
import { ProjectDocument } from "@/lib/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText } from "lucide-react"

interface ContractFormServiceProps {
  formDeliveryDelay: string
  formPaymentSchedule: string
  formSignedQuoteId: string
  formSpecificationId: string
  formPlanningId: string
  signedQuoteDocuments: ProjectDocument[]
  specificationDocuments: ProjectDocument[]
  planningDocuments: ProjectDocument[]
  onDeliveryDelayChange: (value: string) => void
  onPaymentScheduleChange: (value: string) => void
  onSignedQuoteIdChange: (value: string) => void
  onSpecificationIdChange: (value: string) => void
  onPlanningIdChange: (value: string) => void
}

export function ContractFormService({
  formDeliveryDelay,
  formPaymentSchedule,
  formSignedQuoteId,
  formSpecificationId,
  formPlanningId,
  signedQuoteDocuments,
  specificationDocuments,
  planningDocuments,
  onDeliveryDelayChange,
  onPaymentScheduleChange,
  onSignedQuoteIdChange,
  onSpecificationIdChange,
  onPlanningIdChange,
}: ContractFormServiceProps) {
  const { t } = useLanguage()

  return (
    <>
      {/* Delivery delay */}
      <div className="space-y-2">
        <Label>{t('contracts.deliveryDelay')}</Label>
        <Select value={formDeliveryDelay} onValueChange={onDeliveryDelayChange}>
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
        <Select value={formPaymentSchedule} onValueChange={onPaymentScheduleChange}>
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

      {/* Annexes selection */}
      <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 text-sm font-medium text-blue-800">
          <FileText className="w-4 h-4" />
          {t('contracts.annexesSection')}
        </div>
        <p className="text-xs text-blue-600">{t('contracts.annexesSectionHint')}</p>

        {/* Annexe 1: Devis signe */}
        <div className="space-y-2">
          <Label className="text-sm">{t('contracts.annexe1SignedQuote')}</Label>
          <Select value={formSignedQuoteId} onValueChange={onSignedQuoteIdChange}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder={t('contracts.selectDocument')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t('contracts.noDocumentSelected')}</SelectItem>
              {signedQuoteDocuments.map((doc) => (
                <SelectItem key={doc.id} value={doc.id}>
                  {doc.name} (v{doc.version}) - {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {signedQuoteDocuments.length === 0 && (
            <p className="text-xs text-amber-600">{t('contracts.noSignedQuoteAvailable')}</p>
          )}
        </div>

        {/* Annexe 2: Cahier des charges */}
        <div className="space-y-2">
          <Label className="text-sm">{t('contracts.annexe2Specification')}</Label>
          <Select value={formSpecificationId} onValueChange={onSpecificationIdChange}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder={t('contracts.selectDocument')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t('contracts.noDocumentSelected')}</SelectItem>
              {specificationDocuments.map((doc) => (
                <SelectItem key={doc.id} value={doc.id}>
                  {doc.name} (v{doc.version}) - {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {specificationDocuments.length === 0 && (
            <p className="text-xs text-amber-600">{t('contracts.noSpecificationAvailable')}</p>
          )}
        </div>

        {/* Annexe 3: Planning */}
        <div className="space-y-2">
          <Label className="text-sm">{t('contracts.annexe3Planning')}</Label>
          <Select value={formPlanningId} onValueChange={onPlanningIdChange}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder={t('contracts.selectDocument')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t('contracts.noDocumentSelected')}</SelectItem>
              {planningDocuments.map((doc) => (
                <SelectItem key={doc.id} value={doc.id}>
                  {doc.name} (v{doc.version}) - {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {planningDocuments.length === 0 && (
            <p className="text-xs text-amber-600">{t('contracts.noPlanningAvailable')}</p>
          )}
        </div>
      </div>
    </>
  )
}
