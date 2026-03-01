"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { createQuote, updateQuote } from "@/lib/quotes"
import { QuoteFormData, Quote, Project } from "@/lib/types"
import { Loader2, Check, ChevronRight, ChevronLeft, Sparkles, PanelRightOpen } from "lucide-react"
import { QuoteAIAssistant } from "@/components/quote-ai-assistant"
import { useAuth } from "@/contexts/auth-context"
import { StepIndicator } from "@/components/quote-form/step-indicator"
import { StepSummary } from "@/components/quote-form/step-summary"
import { QuoteProfilesSection } from "@/components/quote/quote-profiles-section"
import { QuoteCostingSection } from "@/components/quote/quote-costing-section"

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

  const renderCurrentStep = () => {
    // Steps 1-2: Profiles & Abaques section
    if (currentStep === 1 || currentStep === 2) {
      return <QuoteProfilesSection currentStep={currentStep} formData={formData} setFormData={setFormData} loading={loading} />
    }
    // Steps 3-4: Transverse & Costing section
    if (currentStep === 3 || currentStep === 4) {
      return <QuoteCostingSection currentStep={currentStep} formData={formData} setFormData={setFormData} loading={loading} />
    }
    // Step 5: Summary
    if (currentStep === 5) {
      return <StepSummary formData={formData} setFormData={setFormData} loading={loading} />
    }
    return null
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
