import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/language-context"
import { Plus, Trash2 } from "lucide-react"
import type { QuoteStepProps, Step3Handlers } from "./types"

interface StepTransverseProps extends QuoteStepProps, Step3Handlers {}

export function StepTransverse({ formData, loading, addLevel, removeLevel, addActivity, updateActivity, removeActivity, validProfiles }: StepTransverseProps) {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{t("quotes.form.step3Title")}</h3>
        <p className="text-sm text-foreground/50">{t("quotes.form.step3Desc")}</p>
      </div>

      {validProfiles.length === 0 ? (
        <div className="text-center py-8 text-amber-600 bg-amber-50 rounded-lg">
          {t("quotes.form.noProfilesWarning")}
        </div>
      ) : (
        <div className="space-y-6">
          {formData.transverse_levels.map((level, levelIndex) => (
            <div key={levelIndex} className="border border-border rounded-lg overflow-hidden">
              {/* Level header */}
              <div className="flex items-center justify-between p-3 bg-muted/50 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    {level.level}
                  </span>
                  <div>
                    <span className="font-medium text-foreground">{t("quotes.form.level")} {level.level}</span>
                    <p className="text-xs text-foreground/50">{t("quotes.form.levelDesc")}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLevel(levelIndex)}
                  disabled={loading}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  aria-label="Supprimer le niveau"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Activities list */}
              <div className="p-3 space-y-3">
                {level.activities.length === 0 ? (
                  <p className="text-sm text-foreground/50 text-center py-4">
                    {t("quotes.form.noLevelsWarning")}
                  </p>
                ) : (
                  <>
                    <div className="hidden md:grid md:grid-cols-[1fr_140px_100px_100px_40px] gap-2 px-3 text-xs font-medium text-foreground/50">
                      <div>{t("quotes.form.activityName")}</div>
                      <div>{t("quotes.form.selectProfile")}</div>
                      <div>{t("quotes.form.activityType")}</div>
                      <div>{t("quotes.form.activityValue")}</div>
                      <div></div>
                    </div>

                    {level.activities.map((activity, activityIndex) => (
                      <div key={activityIndex} className="p-3 bg-muted/50 rounded-lg space-y-3 md:space-y-0 md:grid md:grid-cols-[1fr_140px_100px_100px_40px] md:gap-2 md:items-center">
                        <div>
                          <Label className="text-xs text-foreground/70 md:hidden">{t("quotes.form.activityName")}</Label>
                          <Input
                            value={activity.name}
                            onChange={(e) => updateActivity(levelIndex, activityIndex, "name", e.target.value)}
                            placeholder={t("quotes.form.activityNamePlaceholder")}
                            disabled={loading}
                            className="bg-white border-border focus:border-primary"
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-foreground/70 md:hidden">{t("quotes.form.selectProfile")}</Label>
                          <select
                            value={activity.profile_name}
                            onChange={(e) => updateActivity(levelIndex, activityIndex, "profile_name", e.target.value)}
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

                        <div>
                          <Label className="text-xs text-foreground/70 md:hidden">{t("quotes.form.activityType")}</Label>
                          <select
                            value={activity.type}
                            onChange={(e) => updateActivity(levelIndex, activityIndex, "type", e.target.value)}
                            disabled={loading}
                            className="w-full bg-white border border-border rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-primary"
                          >
                            <option value="fixed">{t("quotes.form.typeFixed")}</option>
                            <option value="rate">{t("quotes.form.typeRate")}</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-1">
                          <Label className="text-xs text-foreground/70 md:hidden">{t("quotes.form.activityValue")}</Label>
                          <Input
                            type="number"
                            min="0"
                            step={activity.type === "rate" ? "0.1" : "0.5"}
                            value={activity.value}
                            onChange={(e) => updateActivity(levelIndex, activityIndex, "value", e.target.value)}
                            disabled={loading}
                            className="bg-white border-border focus:border-primary text-center"
                          />
                          <span className="text-xs text-foreground/50 whitespace-nowrap">
                            {activity.type === "rate" ? t("quotes.form.valuePercent") : t("quotes.form.valueDays")}
                          </span>
                        </div>

                        <div className="flex justify-end md:justify-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeActivity(levelIndex, activityIndex)}
                            disabled={loading}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            aria-label="Supprimer l'activite"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addActivity(levelIndex)}
                  disabled={loading}
                  className="w-full bg-white border-dashed border-border hover:border-primary/30 hover:bg-pink-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t("quotes.form.addActivity")}
                </Button>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addLevel}
            disabled={loading}
            className="w-full bg-white border-dashed border-border hover:border-primary/30 hover:bg-pink-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("quotes.form.addLevel")}
          </Button>
        </div>
      )}
    </div>
  )
}
