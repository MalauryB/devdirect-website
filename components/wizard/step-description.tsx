"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/contexts/language-context"
import { ProjectFormData } from "@/lib/types"

type TechLevel = 'beginner' | 'intermediate' | 'advanced' | ''

interface GuidedDescription {
  whatIsIt: string
  whoIsItFor: string
  mainFeatures: string
  inspiration: string
}

interface StepDescriptionProps {
  formData: ProjectFormData
  setFormData: React.Dispatch<React.SetStateAction<ProjectFormData>>
  guidedDescription: GuidedDescription
  setGuidedDescription: React.Dispatch<React.SetStateAction<GuidedDescription>>
  techLevel: TechLevel
}

export function StepDescription({ formData, setFormData, guidedDescription, setGuidedDescription, techLevel }: StepDescriptionProps) {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('projectWizard.description.title')}</h2>
        <p className="text-foreground/60">
          {techLevel === 'beginner'
            ? t('projectWizard.description.subtitleBeginner')
            : t('projectWizard.description.subtitleAdvanced')
          }
        </p>
      </div>

      {techLevel === 'beginner' ? (
        // Guided questions for beginners
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">1</span>
              {t('projectWizard.description.whatIsIt')} *
            </Label>
            <Textarea
              value={guidedDescription.whatIsIt}
              onChange={(e) => setGuidedDescription({ ...guidedDescription, whatIsIt: e.target.value })}
              placeholder={t('projectWizard.description.whatIsItPlaceholder')}
              rows={3}
              className="border-border focus:border-primary resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">2</span>
              {t('projectWizard.description.whoIsItFor')}
            </Label>
            <Textarea
              value={guidedDescription.whoIsItFor}
              onChange={(e) => setGuidedDescription({ ...guidedDescription, whoIsItFor: e.target.value })}
              placeholder={t('projectWizard.description.whoIsItForPlaceholder')}
              rows={2}
              className="border-border focus:border-primary resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">3</span>
              {t('projectWizard.description.mainFeatures')}
            </Label>
            <Textarea
              value={guidedDescription.mainFeatures}
              onChange={(e) => setGuidedDescription({ ...guidedDescription, mainFeatures: e.target.value })}
              placeholder={t('projectWizard.description.mainFeaturesPlaceholder')}
              rows={3}
              className="border-border focus:border-primary resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">4</span>
              {t('projectWizard.description.inspiration')}
            </Label>
            <Textarea
              value={guidedDescription.inspiration}
              onChange={(e) => setGuidedDescription({ ...guidedDescription, inspiration: e.target.value })}
              placeholder={t('projectWizard.description.inspirationPlaceholder')}
              rows={2}
              className="border-border focus:border-primary resize-none"
            />
          </div>
        </div>
      ) : (
        // Free-form for intermediate/advanced
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('projects.form.generalDescription')} *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('projects.form.descriptionPlaceholder')}
              rows={6}
              className="border-border focus:border-primary resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('projects.form.features')}</Label>
            <Textarea
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              placeholder={t('projects.form.featuresPlaceholder')}
              rows={4}
              className="border-border focus:border-primary resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('projects.form.targetAudience')}</Label>
            <Input
              value={formData.target_audience}
              onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
              placeholder={t('projects.form.targetAudiencePlaceholder')}
              className="border-border focus:border-primary"
            />
          </div>

          {/* Existing project */}
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-sm font-medium">{t('projects.form.existingProject')}</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, has_existing_project: false })}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  !formData.has_existing_project
                    ? 'border-primary bg-primary text-white'
                    : 'border-border hover:border-border bg-white'
                }`}
              >
                {t('projects.form.newProject')}
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, has_existing_project: true })}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  formData.has_existing_project
                    ? 'border-primary bg-primary text-white'
                    : 'border-border hover:border-border bg-white'
                }`}
              >
                {t('projects.form.hasExisting')}
              </button>
            </div>
            {formData.has_existing_project && (
              <Textarea
                value={formData.existing_technologies}
                onChange={(e) => setFormData({ ...formData, existing_technologies: e.target.value })}
                placeholder={t('projects.form.existingTechPlaceholder')}
                rows={2}
                className="border-border focus:border-primary resize-none mt-2"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
