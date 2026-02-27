"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/language-context"
import { Quote, ContractType } from "@/lib/types"
import { CalculatedQuoteData } from "@/lib/quote-export"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertCircle,
  Info,
} from "lucide-react"

interface ContractFormCommonProps {
  formType: ContractType
  formTitle: string
  formQuoteId: string
  quotes: Quote[]
  selectedQuote: Quote | null
  quoteData: CalculatedQuoteData | null
  onTypeChange: (value: ContractType) => void
  onTitleChange: (value: string) => void
  onQuoteIdChange: (value: string) => void
}

export function ContractFormCommon({
  formType,
  formTitle,
  formQuoteId,
  quotes,
  selectedQuote,
  quoteData,
  onTypeChange,
  onTitleChange,
  onQuoteIdChange,
}: ContractFormCommonProps) {
  const { t } = useLanguage()

  return (
    <>
      {/* Contract type */}
      <div className="space-y-2">
        <Label>{t('contracts.type')}</Label>
        <Select value={formType} onValueChange={(v) => onTypeChange(v as ContractType)}>
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
            <Select value={formQuoteId} onValueChange={onQuoteIdChange}>
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
        <div className="p-4 bg-muted/50 rounded-lg border border-border space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Info className="w-4 h-4 text-blue-500" />
            {t('contracts.quoteSummary')}
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-foreground/50 text-xs">{t('contracts.totalHT')}</p>
              <p className="font-semibold">{quoteData.totalHT.toLocaleString('fr-FR')} &euro;</p>
            </div>
            <div>
              <p className="text-foreground/50 text-xs">{t('contracts.tva')}</p>
              <p className="font-semibold">{quoteData.totalTVA.toLocaleString('fr-FR')} &euro;</p>
            </div>
            <div>
              <p className="text-foreground/50 text-xs">{t('contracts.totalTTC')}</p>
              <p className="font-semibold text-action">{quoteData.totalTTC.toLocaleString('fr-FR')} &euro;</p>
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
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </div>
    </>
  )
}
