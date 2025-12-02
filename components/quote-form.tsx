"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/contexts/language-context"
import { createQuote, updateQuote } from "@/lib/quotes"
import { QuoteFormData, Quote, QuoteProfile, QuoteStatus } from "@/lib/types"
import { Loader2, Check, Plus, Trash2, ChevronRight, ChevronLeft } from "lucide-react"

interface QuoteFormProps {
  projectId: string
  quote?: Quote | null
  onSuccess?: () => void
  onCancel?: () => void
}

const TOTAL_STEPS = 4

export function QuoteForm({ projectId, quote, onSuccess, onCancel }: QuoteFormProps) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
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
    phases: quote?.phases || [],
    // Step 3
    line_items: quote?.line_items || [],
    // Step 4
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

  // Step indicator
  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step === currentStep
                  ? "bg-gray-900 text-white"
                  : step < currentStep
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {step < currentStep ? <Check className="w-4 h-4" /> : step}
            </div>
            {step < 4 && (
              <div
                className={`w-8 h-0.5 ${
                  step < currentStep ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <span className="text-sm text-foreground/50">
        {t("quotes.form.steps").replace("{current}", String(currentStep)).replace("{total}", String(TOTAL_STEPS))}
      </span>
    </div>
  )

  // Step 1: General Information
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{t("quotes.form.step1Title")}</h3>
        <p className="text-sm text-foreground/50">{t("quotes.form.step1Desc")}</p>
      </div>

      {/* Quote Name */}
      <div className="space-y-2">
        <Label className="text-sm text-foreground/70">{t("quotes.form.name")} *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={t("quotes.form.namePlaceholder")}
          disabled={loading}
          className="border-gray-200 focus:border-gray-400"
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
            className="border-gray-200 focus:border-gray-400"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-foreground/70">{t("quotes.form.endDate")}</Label>
          <Input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            disabled={loading}
            className="border-gray-200 focus:border-gray-400"
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
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
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
          className="border-gray-200 focus:border-gray-400 resize-none"
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
                  className="border-gray-200 focus:border-gray-400"
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
                  className="border-gray-200 focus:border-gray-400"
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
            className="w-full border-dashed border-gray-300 hover:border-gray-400"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("quotes.form.addProfile")}
          </Button>
        </div>
      </div>
    </div>
  )

  // Step 2: Phases (placeholder for now)
  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{t("quotes.form.step2Title")}</h3>
        <p className="text-sm text-foreground/50">{t("quotes.form.step2Desc")}</p>
      </div>
      <div className="text-center py-12 text-foreground/50">
        Étape 2 - Phases (à implémenter)
      </div>
    </div>
  )

  // Step 3: Line Items (placeholder for now)
  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{t("quotes.form.step3Title")}</h3>
        <p className="text-sm text-foreground/50">{t("quotes.form.step3Desc")}</p>
      </div>
      <div className="text-center py-12 text-foreground/50">
        Étape 3 - Lignes du devis (à implémenter)
      </div>
    </div>
  )

  // Step 4: Summary (placeholder for now)
  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{t("quotes.form.step4Title")}</h3>
        <p className="text-sm text-foreground/50">{t("quotes.form.step4Desc")}</p>
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
          className="w-32 border-gray-200 focus:border-gray-400"
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
          className="border-gray-200 focus:border-gray-400"
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
          className="border-gray-200 focus:border-gray-400 resize-none"
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
        <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg flex items-center gap-2">
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
