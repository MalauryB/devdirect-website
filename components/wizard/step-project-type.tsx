"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/language-context"
import { ProjectFormData } from "@/lib/types"
import { Globe, Smartphone, Monitor, Cpu, Brain, HelpCircle } from "lucide-react"

type TechLevel = 'beginner' | 'intermediate' | 'advanced' | ''

interface StepProjectTypeProps {
  formData: ProjectFormData
  setFormData: React.Dispatch<React.SetStateAction<ProjectFormData>>
  techLevel: TechLevel
  handleProjectTypeToggle: (type: string) => void
  handlePlatformToggle: (platform: string) => void
}

export function StepProjectType({ formData, setFormData, techLevel, handleProjectTypeToggle, handlePlatformToggle }: StepProjectTypeProps) {
  const { t } = useLanguage()

  const projectTypeOptions = [
    { id: "web", label: t('projects.types.web'), icon: Globe, description: t('projectWizard.typeDescriptions.web') },
    { id: "mobile", label: t('projects.types.mobile'), icon: Smartphone, description: t('projectWizard.typeDescriptions.mobile') },
    { id: "desktop", label: t('projects.types.desktop'), icon: Monitor, description: t('projectWizard.typeDescriptions.desktop') },
    { id: "iot", label: t('projects.types.iot'), icon: Cpu, description: t('projectWizard.typeDescriptions.iot') },
    { id: "ai", label: t('projects.types.ai'), icon: Brain, description: t('projectWizard.typeDescriptions.ai') },
    { id: "other", label: t('projects.types.other'), icon: HelpCircle, description: t('projectWizard.typeDescriptions.other') }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('projectWizard.projectType.title')}</h2>
        <p className="text-foreground/60">{t('projectWizard.projectType.subtitle')}</p>
      </div>

      {/* Project title */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t('projects.form.title')} *</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder={t('projects.form.titlePlaceholder')}
          className="border-border focus:border-primary"
        />
        {techLevel === 'beginner' && (
          <p className="text-xs text-foreground/50">{t('projectWizard.projectType.titleHint')}</p>
        )}
      </div>

      {/* Project types */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">{t('projectWizard.projectType.whatType')}</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {projectTypeOptions.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => handleProjectTypeToggle(type.id)}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                formData.project_types.includes(type.id)
                  ? 'border-primary bg-muted/50'
                  : 'border-border hover:border-border bg-white'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                formData.project_types.includes(type.id) ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                <type.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">{type.label}</h3>
                {techLevel === 'beginner' && (
                  <p className="text-xs text-foreground/50 mt-1">{type.description}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Platforms - show for web/mobile/desktop */}
      {formData.project_types.some(t => ['web', 'mobile', 'desktop'].includes(t)) && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">{t('projectWizard.projectType.platforms')}</Label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "web", label: "Web" },
              { id: "ios", label: "iOS (iPhone/iPad)" },
              { id: "android", label: "Android" },
              { id: "windows", label: "Windows" },
              { id: "macos", label: "macOS" }
            ].filter(p => {
              if (formData.project_types.includes('web') && p.id === 'web') return true
              if (formData.project_types.includes('mobile') && ['ios', 'android'].includes(p.id)) return true
              if (formData.project_types.includes('desktop') && ['windows', 'macos'].includes(p.id)) return true
              return false
            }).map((platform) => (
              <button
                key={platform.id}
                type="button"
                onClick={() => handlePlatformToggle(platform.id)}
                className={`px-4 py-2 rounded-full border transition-all ${
                  formData.platforms.includes(platform.id)
                    ? 'border-primary bg-primary text-white'
                    : 'border-border hover:border-border bg-white'
                }`}
              >
                {platform.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
