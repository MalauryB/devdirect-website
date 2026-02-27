"use client"

import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/language-context"
import { ProjectFormData } from "@/lib/types"
import { Check } from "lucide-react"

type TechLevel = 'beginner' | 'intermediate' | 'advanced' | ''

interface StepDesignProps {
  formData: ProjectFormData
  setFormData: React.Dispatch<React.SetStateAction<ProjectFormData>>
  techLevel: TechLevel
  handleServiceToggle: (service: string) => void
}

export function StepDesign({ formData, setFormData, techLevel, handleServiceToggle }: StepDesignProps) {
  const { t } = useLanguage()

  const services = [
    { id: "development", label: t('projects.services.development') },
    { id: "design", label: t('projects.services.design') },
    { id: "consulting", label: t('projects.services.consulting') },
    { id: "testing", label: t('projects.services.testing') },
    { id: "deployment", label: t('projects.services.deployment') },
    { id: "maintenance", label: t('projects.services.maintenance') }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('projectWizard.design.title')}</h2>
        <p className="text-foreground/60">{t('projectWizard.design.subtitle')}</p>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">{t('projectWizard.design.needsDesign')}</Label>
        <div className="grid gap-3">
          {[
            { value: 'yes', title: t('projects.form.needsDesignYes'), description: t('projectWizard.design.yesDescription') },
            { value: 'partial', title: t('projects.form.needsDesignPartial'), description: t('projectWizard.design.partialDescription') },
            { value: 'no', title: t('projects.form.needsDesignNo'), description: t('projectWizard.design.noDescription') }
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData({ ...formData, needs_design: option.value })}
              className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                formData.needs_design === option.value
                  ? 'border-primary bg-muted/50'
                  : 'border-border hover:border-border bg-white'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                formData.needs_design === option.value ? 'border-primary bg-primary' : 'border-border'
              }`}>
                {formData.needs_design === option.value && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-foreground">{option.title}</h3>
                {techLevel !== 'advanced' && (
                  <p className="text-sm text-foreground/50 mt-1">{option.description}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Services for intermediate/advanced */}
      {techLevel !== 'beginner' && (
        <div className="space-y-3 pt-4 border-t">
          <Label className="text-sm font-medium">{t('projects.form.services')}</Label>
          <div className="flex flex-wrap gap-2">
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => handleServiceToggle(service.id)}
                className={`px-4 py-2 rounded-full border transition-all ${
                  formData.services.includes(service.id)
                    ? 'border-primary bg-primary text-white'
                    : 'border-border hover:border-border bg-white'
                }`}
              >
                {service.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
