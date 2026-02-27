import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/language-context"
import { Plus, Trash2 } from "lucide-react"
import type { QuoteStepProps, Step2Handlers } from "./types"

interface StepAbaquesProps extends QuoteStepProps, Step2Handlers {}

export function StepAbaques({ formData, loading, addAbaque, updateAbaque, removeAbaque, validProfiles }: StepAbaquesProps) {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{t("quotes.form.step2Title")}</h3>
        <p className="text-sm text-foreground/50">{t("quotes.form.step2Desc")}</p>
      </div>

      {validProfiles.length === 0 ? (
        <div className="text-center py-8 text-amber-600 bg-amber-50 rounded-lg">
          {t("quotes.form.noProfilesWarning")}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Complexity header */}
          <div className="hidden md:grid md:grid-cols-[1fr_140px_repeat(5,60px)_40px] gap-2 px-3 text-xs font-medium text-foreground/50">
            <div>{t("quotes.form.componentName")}</div>
            <div>{t("quotes.form.selectProfile")}</div>
            <div className="text-center">{t("quotes.form.complexity_ts")}</div>
            <div className="text-center">{t("quotes.form.complexity_s")}</div>
            <div className="text-center">{t("quotes.form.complexity_m")}</div>
            <div className="text-center">{t("quotes.form.complexity_c")}</div>
            <div className="text-center">{t("quotes.form.complexity_tc")}</div>
            <div></div>
          </div>

          {/* Abaques list */}
          {formData.abaques.map((abaque, index) => (
            <div key={index} className="p-3 bg-muted/50 rounded-lg space-y-3 md:space-y-0 md:grid md:grid-cols-[1fr_140px_repeat(5,60px)_40px] md:gap-2 md:items-center">
              <div>
                <Label className="text-xs text-foreground/70 md:hidden">{t("quotes.form.componentName")}</Label>
                <Input
                  value={abaque.component_name}
                  onChange={(e) => updateAbaque(index, "component_name", e.target.value)}
                  placeholder={t("quotes.form.componentNamePlaceholder")}
                  disabled={loading}
                  className="bg-white border-border focus:border-primary"
                />
              </div>

              <div>
                <Label className="text-xs text-foreground/70 md:hidden">{t("quotes.form.selectProfile")}</Label>
                <select
                  value={abaque.profile_name}
                  onChange={(e) => updateAbaque(index, "profile_name", e.target.value)}
                  disabled={loading}
                  className="w-full bg-white border border-border rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-primary"
                >
                  <option value="">{t("quotes.form.selectProfile")}</option>
                  {validProfiles.map((profile, pIndex) => (
                    <option key={pIndex} value={profile.name}>
                      {profile.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-5 gap-2 md:contents">
                {(["days_ts", "days_s", "days_m", "days_c", "days_tc"] as const).map((field) => (
                  <div key={field}>
                    <Label className="text-xs text-foreground/70 md:hidden text-center block">
                      {t(`quotes.form.complexity_${field.split("_")[1]}` as "quotes.form.complexity_ts")}
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={abaque[field]}
                      onChange={(e) => updateAbaque(index, field, e.target.value)}
                      disabled={loading}
                      className="bg-white border-border focus:border-primary text-center px-1"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end md:justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAbaque(index)}
                  disabled={loading}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addAbaque}
            disabled={loading}
            className="w-full bg-white border-dashed border-border hover:border-primary/30 hover:bg-pink-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("quotes.form.addAbaque")}
          </Button>
        </div>
      )}
    </div>
  )
}
