import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/contexts/language-context"
import type { QuoteStepProps } from "./types"

export function StepSummary({ formData, setFormData, loading }: QuoteStepProps) {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{t("quotes.form.step5Title")}</h3>
        <p className="text-sm text-foreground/50">{t("quotes.form.step5Desc")}</p>
      </div>

      {/* Validity */}
      <div className="space-y-2">
        <Label className="text-sm text-foreground/70">{t("quotes.form.validityDays")}</Label>
        <Input
          type="number"
          min="1"
          value={formData.validity_days}
          onChange={(e) => setFormData({ ...formData, validity_days: Number(e.target.value) || 30 })}
          disabled={loading}
          className="w-32 bg-white border-border focus:border-primary"
        />
      </div>

      {/* Payment Terms */}
      <div className="space-y-2">
        <Label className="text-sm text-foreground/70">{t("quotes.form.paymentTerms")}</Label>
        <Input
          value={formData.payment_terms}
          onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
          placeholder={t("quotes.form.paymentTermsPlaceholder")}
          disabled={loading}
          className="bg-white border-border focus:border-primary"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label className="text-sm text-foreground/70">{t("quotes.form.notes")}</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder={t("quotes.form.notesPlaceholder")}
          rows={4}
          disabled={loading}
          className="bg-white border-border focus:border-primary resize-none"
        />
      </div>
    </div>
  )
}
