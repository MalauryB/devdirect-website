"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/contexts/language-context"

interface SkillsManagerProps {
  skills: string[]
  onSkillsChange: (skills: string[]) => void
  disabled: boolean
}

export function SkillsManager({ skills, onSkillsChange, disabled }: SkillsManagerProps) {
  const { t } = useLanguage()
  const [newSkill, setNewSkill] = useState("")

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      onSkillsChange([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = (index: number) => {
    onSkillsChange(skills.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">{t('profile.skills')}</h3>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder={t('profile.skillsPlaceholder')}
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          disabled={disabled}
          className="flex-1 border-border focus:border-primary"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addSkill()
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={addSkill}
          disabled={disabled || !newSkill.trim()}
        >
          {t('profile.addSkill')}
        </Button>
      </div>
      {skills.length === 0 ? (
        <p className="text-sm text-foreground/50">{t('profile.noSkills')}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-muted text-foreground rounded-full text-sm"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(index)}
                disabled={disabled}
                className="text-foreground/50 hover:text-foreground ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
