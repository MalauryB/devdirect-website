"use client"

import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/language-context"
import { ProjectFormData } from "@/lib/types"
import { Euro, Clock } from "lucide-react"

type TechLevel = 'beginner' | 'intermediate' | 'advanced' | ''

interface StepBudgetProps {
  formData: ProjectFormData
  setFormData: React.Dispatch<React.SetStateAction<ProjectFormData>>
  techLevel: TechLevel
}

export function StepBudget({ formData, setFormData, techLevel }: StepBudgetProps) {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('projectWizard.budget.title')}</h2>
        <p className="text-foreground/60">{t('projectWizard.budget.subtitle')}</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Euro className="w-4 h-4" />
            {t('projects.form.budget')}
          </Label>
          <div className="grid gap-2">
            {[
              { value: 'small', label: t('projects.budget.small'), hint: techLevel === 'beginner' ? t('projectWizard.budget.smallHint') : '' },
              { value: 'medium', label: t('projects.budget.medium'), hint: techLevel === 'beginner' ? t('projectWizard.budget.mediumHint') : '' },
              { value: 'large', label: t('projects.budget.large'), hint: techLevel === 'beginner' ? t('projectWizard.budget.largeHint') : '' },
              { value: 'xlarge', label: t('projects.budget.xlarge'), hint: techLevel === 'beginner' ? t('projectWizard.budget.xlargeHint') : '' },
              { value: 'flexible', label: t('projects.budget.flexible'), hint: '' }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, budget: option.value })}
                className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${
                  formData.budget === option.value
                    ? 'border-primary bg-muted/50'
                    : 'border-border hover:border-border bg-white'
                }`}
              >
                <span className="font-medium text-foreground">{option.label}</span>
                {option.hint && (
                  <span className="text-sm text-foreground/50">{option.hint}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {t('projects.form.deadline')}
          </Label>
          <div className="grid gap-2">
            {[
              { value: 'urgent', label: t('projects.deadline.urgent') },
              { value: 'short', label: t('projects.deadline.short') },
              { value: 'medium', label: t('projects.deadline.medium') },
              { value: 'long', label: t('projects.deadline.long') },
              { value: 'flexible', label: t('projects.deadline.flexible') }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, deadline: option.value })}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  formData.deadline === option.value
                    ? 'border-primary bg-muted/50'
                    : 'border-border hover:border-border bg-white'
                }`}
              >
                <span className="font-medium text-foreground">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
