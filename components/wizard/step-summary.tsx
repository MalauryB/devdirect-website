"use client"

import { useLanguage } from "@/contexts/language-context"
import { ProjectFormData } from "@/lib/types"

type TechLevel = 'beginner' | 'intermediate' | 'advanced' | ''

interface GuidedDescription {
  whatIsIt: string
  whoIsItFor: string
  mainFeatures: string
  inspiration: string
}

interface StepSummaryProps {
  formData: ProjectFormData
  techLevel: TechLevel
  guidedDescription: GuidedDescription
  buildDescriptionFromGuided: () => string
}

export function StepSummary({ formData, techLevel, buildDescriptionFromGuided }: StepSummaryProps) {
  const { t } = useLanguage()

  const finalDesc = techLevel === 'beginner' ? buildDescriptionFromGuided() : formData.description

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('projectWizard.summary.title')}</h2>
        <p className="text-foreground/60">{t('projectWizard.summary.subtitle')}</p>
      </div>

      <div className="bg-muted/50 rounded-xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-foreground/50">{t('projects.form.title')}</h3>
          <p className="font-semibold text-foreground">{formData.title || '-'}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-foreground/50">{t('projects.form.projectType')}</h3>
          <div className="flex flex-wrap gap-2 mt-1">
            {formData.project_types.map(type => (
              <span key={type} className="px-3 py-1 bg-white rounded-full text-sm border">
                {t(`projects.types.${type}`)}
              </span>
            ))}
          </div>
        </div>

        {formData.platforms.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-foreground/50">{t('projects.form.platforms')}</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {formData.platforms.map(platform => (
                <span key={platform} className="px-3 py-1 bg-white rounded-full text-sm border">
                  {platform}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-foreground/50">{t('projects.form.description')}</h3>
          <p className="text-foreground whitespace-pre-wrap">{finalDesc || '-'}</p>
        </div>

        {formData.needs_design && (
          <div>
            <h3 className="text-sm font-medium text-foreground/50">{t('projects.form.designTitle')}</h3>
            <p className="text-foreground">
              {formData.needs_design === 'yes' && t('projects.form.needsDesignYes')}
              {formData.needs_design === 'partial' && t('projects.form.needsDesignPartial')}
              {formData.needs_design === 'no' && t('projects.form.needsDesignNo')}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {formData.budget && (
            <div>
              <h3 className="text-sm font-medium text-foreground/50">{t('projects.form.budget')}</h3>
              <p className="text-foreground">{t(`projects.budget.${formData.budget}`)}</p>
            </div>
          )}
          {formData.deadline && (
            <div>
              <h3 className="text-sm font-medium text-foreground/50">{t('projects.form.deadline')}</h3>
              <p className="text-foreground">{t(`projects.deadline.${formData.deadline}`)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
