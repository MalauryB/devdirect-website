import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/contexts/language-context"
import { Plus, Trash2 } from "lucide-react"
import type { QuoteStatus } from "@/lib/types"
import type { QuoteStepProps, Step1Handlers } from "./types"

interface StepGeneralProps extends QuoteStepProps, Step1Handlers {}

export function StepGeneral({ formData, setFormData, loading, addProfile, updateProfile, removeProfile }: StepGeneralProps) {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{t("quotes.form.step1Title")}</h3>
          <p className="text-sm text-foreground/50">{t("quotes.form.step1Desc")}</p>
        </div>
      </div>

      {/* Quote Name */}
      <div className="space-y-2">
        <Label className="text-sm text-foreground/70">{t("quotes.form.name")} *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={t("quotes.form.namePlaceholder")}
          disabled={loading}
          aria-required="true"
          className="bg-white border-border focus:border-primary"
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm text-foreground/70">{t("quotes.form.startDate")}</Label>
          <Input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            disabled={loading}
            className="bg-white border-border focus:border-primary"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-foreground/70">{t("quotes.form.endDate")}</Label>
          <Input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            disabled={loading}
            className="bg-white border-border focus:border-primary"
          />
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label className="text-sm text-foreground/70">{t("quotes.status.draft")}</Label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as QuoteStatus })}
          disabled={loading}
          className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
        >
          <option value="draft">{t("quotes.status.draft")}</option>
          <option value="sent">{t("quotes.status.sent")}</option>
          <option value="accepted">{t("quotes.status.accepted")}</option>
          <option value="rejected">{t("quotes.status.rejected")}</option>
          <option value="expired">{t("quotes.status.expired")}</option>
        </select>
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <Label className="text-sm text-foreground/70">{t("quotes.form.comment")}</Label>
        <Textarea
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          placeholder={t("quotes.form.commentPlaceholder")}
          rows={3}
          disabled={loading}
          className="bg-white border-border focus:border-primary resize-none"
        />
      </div>

      {/* Profiles Section */}
      <div className="space-y-3 pt-4 border-t border-muted">
        <div>
          <h4 className="text-sm font-medium text-foreground">{t("quotes.form.profiles")} *</h4>
          <p className="text-xs text-foreground/50">{t("quotes.form.profilesDesc")}</p>
        </div>

        <div className="space-y-3">
          {formData.profiles.map((profile, index) => (
            <div key={index} className="flex items-end gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <Label className="text-xs text-foreground/70">{t("quotes.form.profileName")}</Label>
                <Input
                  value={profile.name}
                  onChange={(e) => updateProfile(index, "name", e.target.value)}
                  placeholder={t("quotes.form.profileNamePlaceholder")}
                  disabled={loading}
                  className="bg-white border-border focus:border-primary"
                />
              </div>
              <div className="w-32">
                <Label className="text-xs text-foreground/70">{t("quotes.form.dailyRate")}</Label>
                <Input
                  type="number"
                  min="0"
                  value={profile.daily_rate}
                  onChange={(e) => updateProfile(index, "daily_rate", e.target.value)}
                  disabled={loading}
                  className="bg-white border-border focus:border-primary"
                />
              </div>
              {formData.profiles.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProfile(index)}
                  disabled={loading}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addProfile}
            disabled={loading}
            className="w-full bg-white border-dashed border-border hover:border-primary/30 hover:bg-pink-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("quotes.form.addProfile")}
          </Button>
        </div>
      </div>
    </div>
  )
}
