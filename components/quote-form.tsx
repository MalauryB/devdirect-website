"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { createQuote, updateQuote } from "@/lib/quotes"
import { QuoteFormData, Quote, QuoteProfile, QuoteAbaque, TransverseActivity, TransverseActivityType, CostingActivity, CostingComponent, ComplexityLevel, Project } from "@/lib/types"
import { Loader2, Check, ChevronRight, ChevronLeft, Sparkles, PanelRightOpen } from "lucide-react"
import { QuoteAIAssistant } from "@/components/quote-ai-assistant"
import { useAuth } from "@/contexts/auth-context"
import { StepIndicator } from "@/components/quote-form/step-indicator"
import { StepGeneral } from "@/components/quote-form/step-general"
import { StepAbaques } from "@/components/quote-form/step-abaques"
import { StepTransverse } from "@/components/quote-form/step-transverse"
import { StepCosting } from "@/components/quote-form/step-costing"
import { StepSummary } from "@/components/quote-form/step-summary"

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
  const { session } = useAuth()
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const isEditing = !!quote

  const [formData, setFormData] = useState<QuoteFormData>({
    name: quote?.name || "",
    start_date: quote?.start_date || "",
    end_date: quote?.end_date || "",
    status: quote?.status || "draft",
    comment: quote?.comment || "",
    profiles: quote?.profiles || [{ name: "", daily_rate: 0 }],
    abaques: quote?.abaques || [],
    transverse_levels: quote?.transverse_levels || [],
    costing_categories: quote?.costing_categories || [],
    notes: quote?.notes || "",
    payment_terms: quote?.payment_terms || "",
    validity_days: quote?.validity_days || 30
  })

  // --- Profile handlers ---
  const addProfile = () => {
    setFormData(prev => ({ ...prev, profiles: [...prev.profiles, { name: "", daily_rate: 0 }] }))
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
    setFormData(prev => ({ ...prev, profiles: prev.profiles.filter((_, i) => i !== index) }))
  }

  // --- Abaque handlers ---
  const addAbaque = () => {
    const defaultProfile = formData.profiles.find(p => p.name.trim() !== "")?.name || ""
    setFormData(prev => ({
      ...prev,
      abaques: [...prev.abaques, { component_name: "", profile_name: defaultProfile, days_ts: 0, days_s: 0, days_m: 0, days_c: 0, days_tc: 0 }]
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
    setFormData(prev => ({ ...prev, abaques: prev.abaques.filter((_, i) => i !== index) }))
  }

  // --- Transverse level handlers ---
  const addLevel = () => {
    const nextLevel = formData.transverse_levels.length
    setFormData(prev => ({ ...prev, transverse_levels: [...prev.transverse_levels, { level: nextLevel, activities: [] }] }))
  }
  const removeLevel = (levelIndex: number) => {
    setFormData(prev => ({
      ...prev,
      transverse_levels: prev.transverse_levels.filter((_, i) => i !== levelIndex).map((lvl, i) => ({ ...lvl, level: i }))
    }))
  }
  const addActivity = (levelIndex: number) => {
    const defaultProfile = formData.profiles.find(p => p.name.trim() !== "")?.name || ""
    setFormData(prev => {
      const newLevels = [...prev.transverse_levels]
      newLevels[levelIndex] = {
        ...newLevels[levelIndex],
        activities: [...newLevels[levelIndex].activities, { name: "", profile_name: defaultProfile, type: "fixed" as TransverseActivityType, value: 0 }]
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
      newLevels[levelIndex] = { ...newLevels[levelIndex], activities: newLevels[levelIndex].activities.filter((_, i) => i !== activityIndex) }
      return { ...prev, transverse_levels: newLevels }
    })
  }

  // --- Costing handlers ---
  const addCategory = () => {
    setFormData(prev => ({ ...prev, costing_categories: [...prev.costing_categories, { name: "", activities: [] }] }))
  }
  const updateCategory = (categoryIndex: number, name: string) => {
    setFormData(prev => {
      const newCategories = [...prev.costing_categories]
      newCategories[categoryIndex] = { ...newCategories[categoryIndex], name }
      return { ...prev, costing_categories: newCategories }
    })
  }
  const removeCategory = (categoryIndex: number) => {
    setFormData(prev => ({ ...prev, costing_categories: prev.costing_categories.filter((_, i) => i !== categoryIndex) }))
  }
  const addCostingActivity = (categoryIndex: number) => {
    setFormData(prev => {
      const newCategories = [...prev.costing_categories]
      newCategories[categoryIndex] = {
        ...newCategories[categoryIndex],
        activities: [...newCategories[categoryIndex].activities, { name: "", active: true, components: [] }]
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
  const addCostingComponent = (categoryIndex: number, activityIndex: number) => {
    const defaultComponent = formData.abaques[0]?.component_name || ""
    setFormData(prev => {
      const newCategories = [...prev.costing_categories]
      const newActivities = [...newCategories[categoryIndex].activities]
      newActivities[activityIndex] = {
        ...newActivities[activityIndex],
        components: [...newActivities[activityIndex].components, { coefficient: 1, component_name: defaultComponent, complexity: "m" as ComplexityLevel, comment: "" }]
      }
      newCategories[categoryIndex] = { ...newCategories[categoryIndex], activities: newActivities }
      return { ...prev, costing_categories: newCategories }
    })
  }
  const updateCostingComponent = (categoryIndex: number, activityIndex: number, componentIndex: number, field: keyof CostingComponent, value: string | number) => {
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

  // --- Validation & navigation ---
  const validateStep = (step: number): boolean => {
    setError("")
    if (step === 1) {
      if (!formData.name.trim()) { setError(t("quotes.errors.nameRequired")); return false }
      const valid = formData.profiles.filter(p => p.name.trim() !== "")
      if (valid.length === 0) { setError(t("quotes.errors.profileRequired")); return false }
    }
    return true
  }

  const goToNextStep = () => { if (validateStep(currentStep)) setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS)) }
  const goToPreviousStep = () => { setCurrentStep(prev => Math.max(prev - 1, 1)) }
  const goToStep = (step: number) => { setCurrentStep(step) }

  // --- AI generation ---
  const handleGenerateWithAI = async () => {
    if (!project) { setError(t("quotes.errors.noProject")); return }
    setGenerating(true)
    setError("")
    try {
      const response = await fetch('/api/generate-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ project })
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate quote')
      }
      const { quote: generatedQuote } = await response.json()
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

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(currentStep)) return
    setError("")
    setSuccess(false)
    setLoading(true)
    const cleanedData = { ...formData, profiles: formData.profiles.filter(p => p.name.trim() !== "") }
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
      setTimeout(() => { setSuccess(false); onSuccess?.() }, 1500)
    }
    setLoading(false)
  }

  const validProfiles = formData.profiles.filter(p => p.name.trim() !== "")

  const renderCurrentStep = () => {
    const baseProps = { formData, setFormData, loading }
    switch (currentStep) {
      case 1: return <StepGeneral {...baseProps} addProfile={addProfile} updateProfile={updateProfile} removeProfile={removeProfile} />
      case 2: return <StepAbaques {...baseProps} addAbaque={addAbaque} updateAbaque={updateAbaque} removeAbaque={removeAbaque} validProfiles={validProfiles} />
      case 3: return <StepTransverse {...baseProps} addLevel={addLevel} removeLevel={removeLevel} addActivity={addActivity} updateActivity={updateActivity} removeActivity={removeActivity} validProfiles={validProfiles} />
      case 4: return <StepCosting {...baseProps} addCategory={addCategory} updateCategory={updateCategory} removeCategory={removeCategory} addCostingActivity={addCostingActivity} updateCostingActivity={updateCostingActivity} removeCostingActivity={removeCostingActivity} addCostingComponent={addCostingComponent} updateCostingComponent={updateCostingComponent} removeCostingComponent={removeCostingComponent} />
      case 5: return <StepSummary {...baseProps} />
      default: return null
    }
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className={`space-y-6 transition-all duration-300 ${aiPanelOpen ? 'mr-[380px]' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <StepIndicator currentStep={currentStep} onGoToStep={goToStep} />
          </div>
          {!aiPanelOpen && (
            <button
              type="button"
              onClick={() => setAiPanelOpen(true)}
              className="flex items-center gap-2 bg-action text-white px-3 py-2 rounded-lg shadow-md hover:bg-action/90 transition-colors ml-4"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">{t('quoteAI.title')}</span>
              <PanelRightOpen className="w-4 h-4" />
            </button>
          )}
        </div>

        {renderCurrentStep()}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
        )}
        {success && (
          <p className="text-sm text-pink-600 bg-pink-50 p-3 rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4" />
            {t("quotes.form.success")}
          </p>
        )}

        <div className="flex gap-3 pt-4 border-t border-muted">
          {onCancel && currentStep === 1 && (
            <Button type="button" variant="outline" className="flex-1 border-border hover:bg-red-50 hover:text-red-600 hover:border-red-200" onClick={onCancel} disabled={loading}>
              {t("quotes.form.cancel")}
            </Button>
          )}
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={goToPreviousStep} disabled={loading} className="flex-1 border-border">
              <ChevronLeft className="w-4 h-4 mr-2" />
              {t("quotes.form.previous")}
            </Button>
          )}
          {currentStep < TOTAL_STEPS ? (
            <Button type="button" onClick={goToNextStep} disabled={loading} className="flex-1 bg-primary hover:bg-primary/90 text-white">
              {t("quotes.form.next")}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-white" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              {isEditing ? t("quotes.form.update") : t("quotes.form.create")}
            </Button>
          )}
        </div>
      </form>

      <QuoteAIAssistant
        quoteData={formData}
        onQuoteUpdate={(modifications) => { setFormData(prev => ({ ...prev, ...modifications })) }}
        projectDescription={project?.description}
        isOpen={aiPanelOpen}
        onToggle={() => setAiPanelOpen(!aiPanelOpen)}
        onGenerateFullQuote={!isEditing && project ? handleGenerateWithAI : undefined}
        isGenerating={generating}
      />
    </div>
  )
}
