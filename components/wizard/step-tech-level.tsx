"use client"

import { useLanguage } from "@/contexts/language-context"
import { Lightbulb, Users, Code } from "lucide-react"

type TechLevel = 'beginner' | 'intermediate' | 'advanced' | ''

interface StepTechLevelProps {
  techLevel: TechLevel
  onSelect: (level: TechLevel) => void
}

export function StepTechLevel({ techLevel, onSelect }: StepTechLevelProps) {
  const { t } = useLanguage()

  const options = [
    {
      value: 'beginner' as const,
      title: t('projectWizard.techLevel.beginner.title'),
      description: t('projectWizard.techLevel.beginner.description'),
      icon: Lightbulb
    },
    {
      value: 'intermediate' as const,
      title: t('projectWizard.techLevel.intermediate.title'),
      description: t('projectWizard.techLevel.intermediate.description'),
      icon: Users
    },
    {
      value: 'advanced' as const,
      title: t('projectWizard.techLevel.advanced.title'),
      description: t('projectWizard.techLevel.advanced.description'),
      icon: Code
    }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('projectWizard.techLevel.title')}</h2>
        <p className="text-foreground/60">{t('projectWizard.techLevel.subtitle')}</p>
      </div>
      <div className="grid gap-4">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
              techLevel === option.value
                ? 'border-primary bg-muted/50'
                : 'border-border hover:border-border bg-white'
            }`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
              techLevel === option.value ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
            }`}>
              <option.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{option.title}</h3>
              <p className="text-sm text-foreground/60 mt-1">{option.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
