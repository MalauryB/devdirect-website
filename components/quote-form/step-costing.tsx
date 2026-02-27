import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/language-context"
import { Plus, Trash2 } from "lucide-react"
import type { QuoteStepProps, Step4Handlers } from "./types"

interface StepCostingProps extends QuoteStepProps, Step4Handlers {}

export function StepCosting({
  formData, loading,
  addCategory, updateCategory, removeCategory,
  addCostingActivity, updateCostingActivity, removeCostingActivity,
  addCostingComponent, updateCostingComponent, removeCostingComponent,
}: StepCostingProps) {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{t("quotes.form.step4Title")}</h3>
        <p className="text-sm text-foreground/50">{t("quotes.form.step4Desc")}</p>
      </div>

      {formData.abaques.length === 0 ? (
        <div className="text-center py-8 text-amber-600 bg-amber-50 rounded-lg">
          {t("quotes.form.noAbaquesWarning")}
        </div>
      ) : (
        <div className="space-y-6">
          {formData.costing_categories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="border border-border rounded-lg overflow-hidden">
              {/* Category header */}
              <div className="flex items-center gap-3 p-3 bg-muted border-b border-border">
                <Input
                  value={category.name}
                  onChange={(e) => updateCategory(categoryIndex, e.target.value)}
                  placeholder={t("quotes.form.categoryNamePlaceholder")}
                  disabled={loading}
                  className="flex-1 border-border focus:border-primary bg-white"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCategory(categoryIndex)}
                  disabled={loading}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Activities */}
              <div className="p-3 space-y-4">
                {category.activities.map((activity, activityIndex) => (
                  <div key={activityIndex} className="border border-muted rounded-lg overflow-hidden">
                    {/* Activity header */}
                    <div className="flex items-center gap-3 p-2 bg-muted/50">
                      <input
                        type="checkbox"
                        checked={activity.active}
                        onChange={(e) => updateCostingActivity(categoryIndex, activityIndex, "active", e.target.checked)}
                        disabled={loading}
                        className="w-4 h-4 rounded border-border"
                      />
                      <Input
                        value={activity.name}
                        onChange={(e) => updateCostingActivity(categoryIndex, activityIndex, "name", e.target.value)}
                        placeholder={t("quotes.form.costingActivityNamePlaceholder")}
                        disabled={loading}
                        className="flex-1 border-border focus:border-primary text-sm"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCostingActivity(categoryIndex, activityIndex)}
                        disabled={loading}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Components */}
                    <div className="p-2 space-y-2">
                      {activity.components.length > 0 && (
                        <div className="hidden md:grid md:grid-cols-[60px_1fr_100px_1fr_40px] gap-2 px-2 text-xs font-medium text-foreground/50">
                          <div>{t("quotes.form.coefficient")}</div>
                          <div>{t("quotes.form.selectComponent")}</div>
                          <div>{t("quotes.form.selectComplexity")}</div>
                          <div>{t("quotes.form.componentComment")}</div>
                          <div></div>
                        </div>
                      )}

                      {activity.components.map((component, componentIndex) => (
                        <div key={componentIndex} className="p-2 bg-white border border-muted rounded space-y-2 md:space-y-0 md:grid md:grid-cols-[60px_1fr_100px_1fr_40px] md:gap-2 md:items-center">
                          <div>
                            <Label className="text-xs text-foreground/70 md:hidden">{t("quotes.form.coefficient")}</Label>
                            <Input
                              type="number"
                              min="0.1"
                              step="0.1"
                              value={component.coefficient}
                              onChange={(e) => updateCostingComponent(categoryIndex, activityIndex, componentIndex, "coefficient", e.target.value)}
                              disabled={loading}
                              className="bg-white border-border focus:border-primary text-center text-sm"
                            />
                          </div>

                          <div>
                            <Label className="text-xs text-foreground/70 md:hidden">{t("quotes.form.selectComponent")}</Label>
                            <select
                              value={component.component_name}
                              onChange={(e) => updateCostingComponent(categoryIndex, activityIndex, componentIndex, "component_name", e.target.value)}
                              disabled={loading}
                              className="w-full bg-white border border-border rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-primary"
                            >
                              <option value="">{t("quotes.form.selectComponent")}</option>
                              {formData.abaques.map((abaque, aIndex) => (
                                <option key={aIndex} value={abaque.component_name}>
                                  {abaque.component_name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <Label className="text-xs text-foreground/70 md:hidden">{t("quotes.form.selectComplexity")}</Label>
                            <select
                              value={component.complexity}
                              onChange={(e) => updateCostingComponent(categoryIndex, activityIndex, componentIndex, "complexity", e.target.value)}
                              disabled={loading}
                              className="w-full bg-white border border-border rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-primary"
                            >
                              <option value="ts">{t("quotes.form.complexity_ts_short")} - {t("quotes.form.complexity_ts_full")}</option>
                              <option value="s">{t("quotes.form.complexity_s_short")} - {t("quotes.form.complexity_s_full")}</option>
                              <option value="m">{t("quotes.form.complexity_m_short")} - {t("quotes.form.complexity_m_full")}</option>
                              <option value="c">{t("quotes.form.complexity_c_short")} - {t("quotes.form.complexity_c_full")}</option>
                              <option value="tc">{t("quotes.form.complexity_tc_short")} - {t("quotes.form.complexity_tc_full")}</option>
                            </select>
                          </div>

                          <div>
                            <Label className="text-xs text-foreground/70 md:hidden">{t("quotes.form.componentComment")}</Label>
                            <Input
                              value={component.comment}
                              onChange={(e) => updateCostingComponent(categoryIndex, activityIndex, componentIndex, "comment", e.target.value)}
                              placeholder={t("quotes.form.componentCommentPlaceholder")}
                              disabled={loading}
                              className="bg-white border-border focus:border-primary text-sm"
                            />
                          </div>

                          <div className="flex justify-end md:justify-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCostingComponent(categoryIndex, activityIndex, componentIndex)}
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
                        size="sm"
                        onClick={() => addCostingComponent(categoryIndex, activityIndex)}
                        disabled={loading}
                        className="w-full bg-white border-dashed border-border hover:border-border hover:bg-pink-50 text-xs"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {t("quotes.form.addComponent")}
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addCostingActivity(categoryIndex)}
                  disabled={loading}
                  className="w-full bg-white border-dashed border-border hover:border-primary/30 hover:bg-pink-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t("quotes.form.addCostingActivity")}
                </Button>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addCategory}
            disabled={loading}
            className="w-full bg-white border-dashed border-border hover:border-primary/30 hover:bg-pink-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("quotes.form.addCategory")}
          </Button>
        </div>
      )}
    </div>
  )
}
