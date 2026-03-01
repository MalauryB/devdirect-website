"use client"

import { QuoteFormData, QuoteProfile, QuoteAbaque } from "@/lib/types"
import { StepGeneral } from "@/components/quote-form/step-general"
import { StepAbaques } from "@/components/quote-form/step-abaques"

interface QuoteProfilesSectionProps {
  currentStep: number
  formData: QuoteFormData
  setFormData: React.Dispatch<React.SetStateAction<QuoteFormData>>
  loading: boolean
}

export function QuoteProfilesSection({ currentStep, formData, setFormData, loading }: QuoteProfilesSectionProps) {
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

  const validProfiles = formData.profiles.filter(p => p.name.trim() !== "")
  const baseProps = { formData, setFormData, loading }

  if (currentStep === 1) {
    return <StepGeneral {...baseProps} addProfile={addProfile} updateProfile={updateProfile} removeProfile={removeProfile} />
  }
  if (currentStep === 2) {
    return <StepAbaques {...baseProps} addAbaque={addAbaque} updateAbaque={updateAbaque} removeAbaque={removeAbaque} validProfiles={validProfiles} />
  }
  return null
}
