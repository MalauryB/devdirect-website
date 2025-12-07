"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/contexts/language-context"
import { createQuote, updateQuote } from "@/lib/quotes"
import { QuoteFormData, Quote, QuoteProfile, QuoteAbaque, QuoteStatus, TransverseLevel, TransverseActivity, TransverseActivityType, CostingCategory, CostingActivity, CostingComponent, ComplexityLevel, Project } from "@/lib/types"
import { Loader2, Check, Plus, Trash2, ChevronRight, ChevronLeft, Sparkles } from "lucide-react"

interface QuoteFormProps {
  projectId: string
  project?: Project | null
  quote?: Quote | null
  onSuccess?: () => void
  onCancel?: () => void
}

const TOTAL_STEPS = 5

export function QuoteForm({ projectId, project, quote, onSuccess, onCancel }: QuoteFormProps) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const isEditing = !!quote

  const [formData, setFormData] = useState<QuoteFormData>({
    // Step 1
    name: quote?.name || "",
    start_date: quote?.start_date || "",
    end_date: quote?.end_date || "",
    status: quote?.status || "draft",
    comment: quote?.comment || "",
    profiles: quote?.profiles || [{ name: "", daily_rate: 0 }],
    // Step 2
    abaques: quote?.abaques || [],
    // Step 3
    transverse_levels: quote?.transverse_levels || [],
    // Step 4
    costing_categories: quote?.costing_categories || [],
    // Step 5: Récapitulatif
    notes: quote?.notes || "",
    payment_terms: quote?.payment_terms || "",
    validity_days: quote?.validity_days || 30
  })

  // Profile management
  const addProfile = () => {
    setFormData(prev => ({
      ...prev,
      profiles: [...prev.profiles, { name: "", daily_rate: 0 }]
    }))
  }

  const updateProfile = (index: number, field: keyof QuoteProfile, value: string | number) => {
    setFormData(prev => {
      const newProfiles = [...prev.profiles]
      if (field === "name") {
        newProfiles[index] = { ...newProfiles[index], name: value as string }
      } else {
        newProfiles[index] = { ...newProfiles[index], daily_rate: Number(value) || 0 }
      }
      return { ...prev, profiles: newProfiles }
    })
  }

  const removeProfile = (index: number) => {
    if (formData.profiles.length <= 1) return
    setFormData(prev => ({
      ...prev,
      profiles: prev.profiles.filter((_, i) => i !== index)
    }))
  }

  // Abaque management
  const addAbaque = () => {
    const defaultProfile = formData.profiles.find(p => p.name.trim() !== "")?.name || ""
    setFormData(prev => ({
      ...prev,
      abaques: [...prev.abaques, {
        component_name: "",
        profile_name: defaultProfile,
        days_ts: 0,
        days_s: 0,
        days_m: 0,
        days_c: 0,
        days_tc: 0
      }]
    }))
  }

  const updateAbaque = (index: number, field: keyof QuoteAbaque, value: string | number) => {
    setFormData(prev => {
      const newAbaques = [...prev.abaques]
      if (field === "component_name" || field === "profile_name") {
        newAbaques[index] = { ...newAbaques[index], [field]: value as string }
      } else {
        newAbaques[index] = { ...newAbaques[index], [field]: Number(value) || 0 }
      }
      return { ...prev, abaques: newAbaques }
    })
  }

  const removeAbaque = (index: number) => {
    setFormData(prev => ({
      ...prev,
      abaques: prev.abaques.filter((_, i) => i !== index)
    }))
  }

  // Transverse levels management
  const addLevel = () => {
    const nextLevel = formData.transverse_levels.length
    setFormData(prev => ({
      ...prev,
      transverse_levels: [...prev.transverse_levels, { level: nextLevel, activities: [] }]
    }))
  }

  const removeLevel = (levelIndex: number) => {
    setFormData(prev => ({
      ...prev,
      transverse_levels: prev.transverse_levels
        .filter((_, i) => i !== levelIndex)
        .map((lvl, i) => ({ ...lvl, level: i })) // Re-index levels
    }))
  }

  const addActivity = (levelIndex: number) => {
    const defaultProfile = formData.profiles.find(p => p.name.trim() !== "")?.name || ""
    setFormData(prev => {
      const newLevels = [...prev.transverse_levels]
      newLevels[levelIndex] = {
        ...newLevels[levelIndex],
        activities: [...newLevels[levelIndex].activities, {
          name: "",
          profile_name: defaultProfile,
          type: "fixed" as TransverseActivityType,
          value: 0
        }]
      }
      return { ...prev, transverse_levels: newLevels }
    })
  }

  const updateActivity = (levelIndex: number, activityIndex: number, field: keyof TransverseActivity, value: string | number) => {
    setFormData(prev => {
      const newLevels = [...prev.transverse_levels]
      const newActivities = [...newLevels[levelIndex].activities]
      if (field === "name" || field === "profile_name") {
        newActivities[activityIndex] = { ...newActivities[activityIndex], [field]: value as string }
      } else if (field === "type") {
        newActivities[activityIndex] = { ...newActivities[activityIndex], type: value as TransverseActivityType }
      } else {
        newActivities[activityIndex] = { ...newActivities[activityIndex], value: Number(value) || 0 }
      }
      newLevels[levelIndex] = { ...newLevels[levelIndex], activities: newActivities }
      return { ...prev, transverse_levels: newLevels }
    })
  }

  const removeActivity = (levelIndex: number, activityIndex: number) => {
    setFormData(prev => {
      const newLevels = [...prev.transverse_levels]
      newLevels[levelIndex] = {
        ...newLevels[levelIndex],
        activities: newLevels[levelIndex].activities.filter((_, i) => i !== activityIndex)
      }
      return { ...prev, transverse_levels: newLevels }
    })
  }

  // Costing categories management (Step 4)
  const addCategory = () => {
    setFormData(prev => ({
      ...prev,
      costing_categories: [...prev.costing_categories, { name: "", activities: [] }]
    }))
  }

  const updateCategory = (categoryIndex: number, name: string) => {
    setFormData(prev => {
      const newCategories = [...prev.costing_categories]
      newCategories[categoryIndex] = { ...newCategories[categoryIndex], name }
      return { ...prev, costing_categories: newCategories }
    })
  }

  const removeCategory = (categoryIndex: number) => {
    setFormData(prev => ({
      ...prev,
      costing_categories: prev.costing_categories.filter((_, i) => i !== categoryIndex)
    }))
  }

  // Costing activities management
  const addCostingActivity = (categoryIndex: number) => {
    setFormData(prev => {
      const newCategories = [...prev.costing_categories]
      newCategories[categoryIndex] = {
        ...newCategories[categoryIndex],
        activities: [...newCategories[categoryIndex].activities, {
          name: "",
          active: true,
          components: []
        }]
      }
      return { ...prev, costing_categories: newCategories }
    })
  }

  const updateCostingActivity = (categoryIndex: number, activityIndex: number, field: keyof CostingActivity, value: string | boolean) => {
    setFormData(prev => {
      const newCategories = [...prev.costing_categories]
      const newActivities = [...newCategories[categoryIndex].activities]
      if (field === "name") {
        newActivities[activityIndex] = { ...newActivities[activityIndex], name: value as string }
      } else if (field === "active") {
        newActivities[activityIndex] = { ...newActivities[activityIndex], active: value as boolean }
      }
      newCategories[categoryIndex] = { ...newCategories[categoryIndex], activities: newActivities }
      return { ...prev, costing_categories: newCategories }
    })
  }

  const removeCostingActivity = (categoryIndex: number, activityIndex: number) => {
    setFormData(prev => {
      const newCategories = [...prev.costing_categories]
      newCategories[categoryIndex] = {
        ...newCategories[categoryIndex],
        activities: newCategories[categoryIndex].activities.filter((_, i) => i !== activityIndex)
      }
      return { ...prev, costing_categories: newCategories }
    })
  }

  // Costing components management
  const addCostingComponent = (categoryIndex: number, activityIndex: number) => {
    const defaultComponent = formData.abaques[0]?.component_name || ""
    setFormData(prev => {
      const newCategories = [...prev.costing_categories]
      const newActivities = [...newCategories[categoryIndex].activities]
      newActivities[activityIndex] = {
        ...newActivities[activityIndex],
        components: [...newActivities[activityIndex].components, {
          coefficient: 1,
          component_name: defaultComponent,
          complexity: "m" as ComplexityLevel,
          comment: ""
        }]
      }
      newCategories[categoryIndex] = { ...newCategories[categoryIndex], activities: newActivities }
      return { ...prev, costing_categories: newCategories }
    })
  }

  const updateCostingComponent = (
    categoryIndex: number,
    activityIndex: number,
    componentIndex: number,
    field: keyof CostingComponent,
    value: string | number
  ) => {
    setFormData(prev => {
      const newCategories = [...prev.costing_categories]
      const newActivities = [...newCategories[categoryIndex].activities]
      const newComponents = [...newActivities[activityIndex].components]
      if (field === "coefficient") {
        newComponents[componentIndex] = { ...newComponents[componentIndex], coefficient: Number(value) || 1 }
      } else if (field === "component_name" || field === "comment") {
        newComponents[componentIndex] = { ...newComponents[componentIndex], [field]: value as string }
      } else if (field === "complexity") {
        newComponents[componentIndex] = { ...newComponents[componentIndex], complexity: value as ComplexityLevel }
      }
      newActivities[activityIndex] = { ...newActivities[activityIndex], components: newComponents }
      newCategories[categoryIndex] = { ...newCategories[categoryIndex], activities: newActivities }
      return { ...prev, costing_categories: newCategories }
    })
  }

  const removeCostingComponent = (categoryIndex: number, activityIndex: number, componentIndex: number) => {
    setFormData(prev => {
      const newCategories = [...prev.costing_categories]
      const newActivities = [...newCategories[categoryIndex].activities]
      newActivities[activityIndex] = {
        ...newActivities[activityIndex],
        components: newActivities[activityIndex].components.filter((_, i) => i !== componentIndex)
      }
      newCategories[categoryIndex] = { ...newCategories[categoryIndex], activities: newActivities }
      return { ...prev, costing_categories: newCategories }
    })
  }

  // Step validation
  const validateStep = (step: number): boolean => {
    setError("")

    if (step === 1) {
      if (!formData.name.trim()) {
        setError(t("quotes.errors.nameRequired"))
        return false
      }
      const validProfiles = formData.profiles.filter(p => p.name.trim() !== "")
      if (validProfiles.length === 0) {
        setError(t("quotes.errors.profileRequired"))
        return false
      }
    }

    return true
  }

  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS))
    }
  }

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  // AI Quote Generation
  const handleGenerateWithAI = async () => {
    if (!project) {
      setError(t("quotes.errors.noProject"))
      return
    }

    setGenerating(true)
    setError("")

    try {
      const response = await fetch('/api/generate-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate quote')
      }

      const { quote: generatedQuote } = await response.json()

      // Update form data with generated quote
      setFormData(prev => ({
        ...prev,
        name: generatedQuote.name || prev.name,
        comment: generatedQuote.comment || prev.comment,
        profiles: generatedQuote.profiles || prev.profiles,
        abaques: generatedQuote.abaques || prev.abaques,
        transverse_levels: generatedQuote.transverse_levels || prev.transverse_levels,
        costing_categories: generatedQuote.costing_categories || prev.costing_categories,
        notes: generatedQuote.notes || prev.notes,
        payment_terms: generatedQuote.payment_terms || prev.payment_terms,
        validity_days: generatedQuote.validity_days || prev.validity_days
      }))

    } catch (err) {
      setError(err instanceof Error ? err.message : t("quotes.errors.generateFailed"))
    } finally {
      setGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep(currentStep)) return

    setError("")
    setSuccess(false)
    setLoading(true)

    // Clean up profiles (remove empty ones)
    const cleanedData = {
      ...formData,
      profiles: formData.profiles.filter(p => p.name.trim() !== "")
    }

    let submitError: Error | null = null

    if (isEditing && quote) {
      const { error } = await updateQuote(quote.id, cleanedData)
      submitError = error
    } else {
      const { error } = await createQuote(projectId, cleanedData)
      submitError = error
    }

    if (submitError) {
      setError(isEditing ? t("quotes.errors.updateFailed") : t("quotes.errors.createFailed"))
    } else {
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onSuccess?.()
      }, 1500)
    }

    setLoading(false)
  }

  // Step names for navigation
  const stepNames = [
    { step: 1, key: "step1Title" },
    { step: 2, key: "step2Title" },
    { step: 3, key: "step3Title" },
    { step: 4, key: "step4Title" },
    { step: 5, key: "step5Title" }
  ]

  const goToStep = (step: number) => {
    // Allow navigation to any step (no validation required for navigation)
    setCurrentStep(step)
  }

  // Step indicator
  const renderStepIndicator = () => (
    <div className="mb-6">
      {/* Desktop: horizontal tabs */}
      <div className="hidden md:flex items-center border-b border-gray-200">
        {stepNames.map(({ step, key }, index) => (
          <button
            key={step}
            type="button"
            onClick={() => goToStep(step)}
            className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              step === currentStep
                ? "text-gray-900 border-b-2 border-gray-900 -mb-px"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span>{t(`quotes.form.${key}`)}</span>
          </button>
        ))}
      </div>

      {/* Mobile: compact dropdown-style or scrollable */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            {t(`quotes.form.${stepNames[currentStep - 1].key}`)}
          </span>
          <span className="text-sm text-foreground/50">
            {currentStep} / {TOTAL_STEPS}
          </span>
        </div>
        <div className="flex gap-1">
          {stepNames.map(({ step }) => (
            <button
              key={step}
              type="button"
              onClick={() => goToStep(step)}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                step === currentStep
                  ? "bg-gray-900"
                  : step < currentStep
                  ? "bg-gray-400"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )

  // Step 1: General Information
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{t("quotes.form.step1Title")}</h3>
          <p className="text-sm text-foreground/50">{t("quotes.form.step1Desc")}</p>
        </div>
        {!isEditing && project && (
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerateWithAI}
            disabled={generating || loading}
            className="shrink-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600 hover:text-white"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {generating ? t("quotes.form.generating") : t("quotes.form.generateWithAI")}
          </Button>
        )}
      </div>

      {/* Quote Name */}
      <div className="space-y-2">
        <Label className="text-sm text-foreground/70">{t("quotes.form.name")} *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={t("quotes.form.namePlaceholder")}
          disabled={loading}
          className="bg-white border-gray-200 focus:border-gray-400"
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
            className="bg-white border-gray-200 focus:border-gray-400"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-foreground/70">{t("quotes.form.endDate")}</Label>
          <Input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            disabled={loading}
            className="bg-white border-gray-200 focus:border-gray-400"
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
          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
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
          className="bg-white border-gray-200 focus:border-gray-400 resize-none"
        />
      </div>

      {/* Profiles Section */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <div>
          <h4 className="text-sm font-medium text-foreground">{t("quotes.form.profiles")} *</h4>
          <p className="text-xs text-foreground/50">{t("quotes.form.profilesDesc")}</p>
        </div>

        <div className="space-y-3">
          {formData.profiles.map((profile, index) => (
            <div key={index} className="flex items-end gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <Label className="text-xs text-foreground/70">{t("quotes.form.profileName")}</Label>
                <Input
                  value={profile.name}
                  onChange={(e) => updateProfile(index, "name", e.target.value)}
                  placeholder={t("quotes.form.profileNamePlaceholder")}
                  disabled={loading}
                  className="bg-white border-gray-200 focus:border-gray-400"
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
                  className="bg-white border-gray-200 focus:border-gray-400"
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
            className="w-full bg-white border-dashed border-gray-300 hover:border-gray-400 hover:bg-pink-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("quotes.form.addProfile")}
          </Button>
        </div>
      </div>
    </div>
  )

  // Get valid profiles for dropdown
  const validProfiles = formData.profiles.filter(p => p.name.trim() !== "")

  // Step 2: Abaques (grilles de chiffrage)
  const renderStep2 = () => (
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
            <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-3 md:space-y-0 md:grid md:grid-cols-[1fr_140px_repeat(5,60px)_40px] md:gap-2 md:items-center">
              {/* Component name */}
              <div>
                <Label className="text-xs text-foreground/70 md:hidden">{t("quotes.form.componentName")}</Label>
                <Input
                  value={abaque.component_name}
                  onChange={(e) => updateAbaque(index, "component_name", e.target.value)}
                  placeholder={t("quotes.form.componentNamePlaceholder")}
                  disabled={loading}
                  className="bg-white border-gray-200 focus:border-gray-400"
                />
              </div>

              {/* Profile selector */}
              <div>
                <Label className="text-xs text-foreground/70 md:hidden">{t("quotes.form.selectProfile")}</Label>
                <select
                  value={abaque.profile_name}
                  onChange={(e) => updateAbaque(index, "profile_name", e.target.value)}
                  disabled={loading}
                  className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-gray-400"
                >
                  <option value="">{t("quotes.form.selectProfile")}</option>
                  {validProfiles.map((profile, pIndex) => (
                    <option key={pIndex} value={profile.name}>
                      {profile.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Days inputs for each complexity level */}
              <div className="grid grid-cols-5 gap-2 md:contents">
                {(["days_ts", "days_s", "days_m", "days_c", "days_tc"] as const).map((field, fieldIndex) => (
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
                      className="bg-white border-gray-200 focus:border-gray-400 text-center px-1"
                    />
                  </div>
                ))}
              </div>

              {/* Delete button */}
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

          {/* Add abaque button */}
          <Button
            type="button"
            variant="outline"
            onClick={addAbaque}
            disabled={loading}
            className="w-full bg-white border-dashed border-gray-300 hover:border-gray-400 hover:bg-pink-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("quotes.form.addAbaque")}
          </Button>
        </div>
      )}
    </div>
  )

  // Step 3: Transverse Activities
  const renderStep3 = () => (
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
          {/* Levels */}
          {formData.transverse_levels.map((level, levelIndex) => (
            <div key={levelIndex} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Level header */}
              <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
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
                    {/* Activity header */}
                    <div className="hidden md:grid md:grid-cols-[1fr_140px_100px_100px_40px] gap-2 px-3 text-xs font-medium text-foreground/50">
                      <div>{t("quotes.form.activityName")}</div>
                      <div>{t("quotes.form.selectProfile")}</div>
                      <div>{t("quotes.form.activityType")}</div>
                      <div>{t("quotes.form.activityValue")}</div>
                      <div></div>
                    </div>

                    {level.activities.map((activity, activityIndex) => (
                      <div key={activityIndex} className="p-3 bg-gray-50 rounded-lg space-y-3 md:space-y-0 md:grid md:grid-cols-[1fr_140px_100px_100px_40px] md:gap-2 md:items-center">
                        {/* Activity name */}
                        <div>
                          <Label className="text-xs text-foreground/70 md:hidden">{t("quotes.form.activityName")}</Label>
                          <Input
                            value={activity.name}
                            onChange={(e) => updateActivity(levelIndex, activityIndex, "name", e.target.value)}
                            placeholder={t("quotes.form.activityNamePlaceholder")}
                            disabled={loading}
                            className="bg-white border-gray-200 focus:border-gray-400"
                          />
                        </div>

                        {/* Profile selector */}
                        <div>
                          <Label className="text-xs text-foreground/70 md:hidden">{t("quotes.form.selectProfile")}</Label>
                          <select
                            value={activity.profile_name}
                            onChange={(e) => updateActivity(levelIndex, activityIndex, "profile_name", e.target.value)}
                            disabled={loading}
                            className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-gray-400"
                          >
                            <option value="">{t("quotes.form.selectProfile")}</option>
                            {validProfiles.map((profile, pIndex) => (
                              <option key={pIndex} value={profile.name}>
                                {profile.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Type selector */}
                        <div>
                          <Label className="text-xs text-foreground/70 md:hidden">{t("quotes.form.activityType")}</Label>
                          <select
                            value={activity.type}
                            onChange={(e) => updateActivity(levelIndex, activityIndex, "type", e.target.value)}
                            disabled={loading}
                            className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-gray-400"
                          >
                            <option value="fixed">{t("quotes.form.typeFixed")}</option>
                            <option value="rate">{t("quotes.form.typeRate")}</option>
                          </select>
                        </div>

                        {/* Value input */}
                        <div className="flex items-center gap-1">
                          <Label className="text-xs text-foreground/70 md:hidden">{t("quotes.form.activityValue")}</Label>
                          <Input
                            type="number"
                            min="0"
                            step={activity.type === "rate" ? "0.1" : "0.5"}
                            value={activity.value}
                            onChange={(e) => updateActivity(levelIndex, activityIndex, "value", e.target.value)}
                            disabled={loading}
                            className="bg-white border-gray-200 focus:border-gray-400 text-center"
                          />
                          <span className="text-xs text-foreground/50 whitespace-nowrap">
                            {activity.type === "rate" ? t("quotes.form.valuePercent") : t("quotes.form.valueDays")}
                          </span>
                        </div>

                        {/* Delete button */}
                        <div className="flex justify-end md:justify-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeActivity(levelIndex, activityIndex)}
                            disabled={loading}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Add activity button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addActivity(levelIndex)}
                  disabled={loading}
                  className="w-full bg-white border-dashed border-gray-300 hover:border-gray-400 hover:bg-pink-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t("quotes.form.addActivity")}
                </Button>
              </div>
            </div>
          ))}

          {/* Add level button */}
          <Button
            type="button"
            variant="outline"
            onClick={addLevel}
            disabled={loading}
            className="w-full bg-white border-dashed border-gray-300 hover:border-gray-400 hover:bg-pink-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("quotes.form.addLevel")}
          </Button>
        </div>
      )}
    </div>
  )

  // Step 4: Costing Elements
  const renderStep4 = () => (
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
          {/* Categories */}
          {formData.costing_categories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Category header */}
              <div className="flex items-center gap-3 p-3 bg-gray-100 border-b border-gray-200">
                <Input
                  value={category.name}
                  onChange={(e) => updateCategory(categoryIndex, e.target.value)}
                  placeholder={t("quotes.form.categoryNamePlaceholder")}
                  disabled={loading}
                  className="flex-1 border-gray-200 focus:border-gray-400 bg-white"
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
                  <div key={activityIndex} className="border border-gray-100 rounded-lg overflow-hidden">
                    {/* Activity header */}
                    <div className="flex items-center gap-3 p-2 bg-gray-50">
                      <input
                        type="checkbox"
                        checked={activity.active}
                        onChange={(e) => updateCostingActivity(categoryIndex, activityIndex, "active", e.target.checked)}
                        disabled={loading}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <Input
                        value={activity.name}
                        onChange={(e) => updateCostingActivity(categoryIndex, activityIndex, "name", e.target.value)}
                        placeholder={t("quotes.form.costingActivityNamePlaceholder")}
                        disabled={loading}
                        className="flex-1 border-gray-200 focus:border-gray-400 text-sm"
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
                        <div key={componentIndex} className="p-2 bg-white border border-gray-100 rounded space-y-2 md:space-y-0 md:grid md:grid-cols-[60px_1fr_100px_1fr_40px] md:gap-2 md:items-center">
                          {/* Coefficient */}
                          <div>
                            <Label className="text-xs text-foreground/70 md:hidden">{t("quotes.form.coefficient")}</Label>
                            <Input
                              type="number"
                              min="0.1"
                              step="0.1"
                              value={component.coefficient}
                              onChange={(e) => updateCostingComponent(categoryIndex, activityIndex, componentIndex, "coefficient", e.target.value)}
                              disabled={loading}
                              className="bg-white border-gray-200 focus:border-gray-400 text-center text-sm"
                            />
                          </div>

                          {/* Component selector (from abaques) */}
                          <div>
                            <Label className="text-xs text-foreground/70 md:hidden">{t("quotes.form.selectComponent")}</Label>
                            <select
                              value={component.component_name}
                              onChange={(e) => updateCostingComponent(categoryIndex, activityIndex, componentIndex, "component_name", e.target.value)}
                              disabled={loading}
                              className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-gray-400"
                            >
                              <option value="">{t("quotes.form.selectComponent")}</option>
                              {formData.abaques.map((abaque, aIndex) => (
                                <option key={aIndex} value={abaque.component_name}>
                                  {abaque.component_name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Complexity selector */}
                          <div>
                            <Label className="text-xs text-foreground/70 md:hidden">{t("quotes.form.selectComplexity")}</Label>
                            <select
                              value={component.complexity}
                              onChange={(e) => updateCostingComponent(categoryIndex, activityIndex, componentIndex, "complexity", e.target.value)}
                              disabled={loading}
                              className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-gray-400"
                            >
                              <option value="ts">{t("quotes.form.complexity_ts_short")} - {t("quotes.form.complexity_ts_full")}</option>
                              <option value="s">{t("quotes.form.complexity_s_short")} - {t("quotes.form.complexity_s_full")}</option>
                              <option value="m">{t("quotes.form.complexity_m_short")} - {t("quotes.form.complexity_m_full")}</option>
                              <option value="c">{t("quotes.form.complexity_c_short")} - {t("quotes.form.complexity_c_full")}</option>
                              <option value="tc">{t("quotes.form.complexity_tc_short")} - {t("quotes.form.complexity_tc_full")}</option>
                            </select>
                          </div>

                          {/* Comment */}
                          <div>
                            <Label className="text-xs text-foreground/70 md:hidden">{t("quotes.form.componentComment")}</Label>
                            <Input
                              value={component.comment}
                              onChange={(e) => updateCostingComponent(categoryIndex, activityIndex, componentIndex, "comment", e.target.value)}
                              placeholder={t("quotes.form.componentCommentPlaceholder")}
                              disabled={loading}
                              className="bg-white border-gray-200 focus:border-gray-400 text-sm"
                            />
                          </div>

                          {/* Delete button */}
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

                      {/* Add component button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addCostingComponent(categoryIndex, activityIndex)}
                        disabled={loading}
                        className="w-full bg-white border-dashed border-gray-200 hover:border-gray-300 hover:bg-pink-50 text-xs"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {t("quotes.form.addComponent")}
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Add activity button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addCostingActivity(categoryIndex)}
                  disabled={loading}
                  className="w-full bg-white border-dashed border-gray-300 hover:border-gray-400 hover:bg-pink-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t("quotes.form.addCostingActivity")}
                </Button>
              </div>
            </div>
          ))}

          {/* Add category button */}
          <Button
            type="button"
            variant="outline"
            onClick={addCategory}
            disabled={loading}
            className="w-full bg-white border-dashed border-gray-300 hover:border-gray-400 hover:bg-pink-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("quotes.form.addCategory")}
          </Button>
        </div>
      )}
    </div>
  )

  // Step 5: Summary
  const renderStep5 = () => (
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
          className="w-32 bg-white border-gray-200 focus:border-gray-400"
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
          className="bg-white border-gray-200 focus:border-gray-400"
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
          className="bg-white border-gray-200 focus:border-gray-400 resize-none"
        />
      </div>
    </div>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1()
      case 2:
        return renderStep2()
      case 3:
        return renderStep3()
      case 4:
        return renderStep4()
      case 5:
        return renderStep5()
      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {renderStepIndicator()}

      {renderCurrentStep()}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-pink-600 bg-pink-50 p-3 rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4" />
          {t("quotes.form.success")}
        </p>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        {onCancel && currentStep === 1 && (
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            onClick={onCancel}
            disabled={loading}
          >
            {t("quotes.form.cancel")}
          </Button>
        )}

        {currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={goToPreviousStep}
            disabled={loading}
            className="flex-1 border-gray-200"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {t("quotes.form.previous")}
          </Button>
        )}

        {currentStep < TOTAL_STEPS ? (
          <Button
            type="button"
            onClick={goToNextStep}
            disabled={loading}
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
          >
            {t("quotes.form.next")}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            type="submit"
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            {isEditing ? t("quotes.form.update") : t("quotes.form.create")}
          </Button>
        )}
      </div>
    </form>
  )
}
