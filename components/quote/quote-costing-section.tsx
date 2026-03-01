"use client"

import { QuoteFormData, TransverseActivity, TransverseActivityType, CostingActivity, CostingComponent, ComplexityLevel } from "@/lib/types"
import { StepTransverse } from "@/components/quote-form/step-transverse"
import { StepCosting } from "@/components/quote-form/step-costing"

interface QuoteCostingSectionProps {
  currentStep: number
  formData: QuoteFormData
  setFormData: React.Dispatch<React.SetStateAction<QuoteFormData>>
  loading: boolean
}

export function QuoteCostingSection({ currentStep, formData, setFormData, loading }: QuoteCostingSectionProps) {
  const validProfiles = formData.profiles.filter(p => p.name.trim() !== "")

  // --- Transverse level handlers ---
  const addLevel = () => {
    const nextLevel = formData.transverse_levels.length
    setFormData(prev => ({ ...prev, transverse_levels: [...prev.transverse_levels, { level: nextLevel, activities: [] }] }))
  }
  const removeLevel = (levelIndex: number) => {
    setFormData(prev => ({
      ...prev,
      transverse_levels: prev.transverse_levels.filter((_, i) => i !== levelIndex).map((lvl, i) => ({ ...lvl, level: i }))
    }))
  }
  const addActivity = (levelIndex: number) => {
    const defaultProfile = formData.profiles.find(p => p.name.trim() !== "")?.name || ""
    setFormData(prev => {
      const newLevels = [...prev.transverse_levels]
      newLevels[levelIndex] = {
        ...newLevels[levelIndex],
        activities: [...newLevels[levelIndex].activities, { name: "", profile_name: defaultProfile, type: "fixed" as TransverseActivityType, value: 0 }]
      }
      return { ...prev, transverse_levels: newLevels }
    })
  }
  const updateActivity = (levelIndex: number, activityIndex: number, field: keyof TransverseActivity, value: string | number) => {
    setFormData(prev => {
      const newLevels = [...prev.transverse_levels]
      const newActivities = [...newLevels[levelIndex].activities]
      if (field === "name" || field === "profile_name") {
        newActivities[activityIndex] = { ...newActivities[activityIndex], [field]: value as string }
      } else if (field === "type") {
        newActivities[activityIndex] = { ...newActivities[activityIndex], type: value as TransverseActivityType }
      } else {
        newActivities[activityIndex] = { ...newActivities[activityIndex], value: Number(value) || 0 }
      }
      newLevels[levelIndex] = { ...newLevels[levelIndex], activities: newActivities }
      return { ...prev, transverse_levels: newLevels }
    })
  }
  const removeActivity = (levelIndex: number, activityIndex: number) => {
    setFormData(prev => {
      const newLevels = [...prev.transverse_levels]
      newLevels[levelIndex] = { ...newLevels[levelIndex], activities: newLevels[levelIndex].activities.filter((_, i) => i !== activityIndex) }
      return { ...prev, transverse_levels: newLevels }
    })
  }

  // --- Costing handlers ---
  const addCategory = () => {
    setFormData(prev => ({ ...prev, costing_categories: [...prev.costing_categories, { name: "", activities: [] }] }))
  }
  const updateCategory = (categoryIndex: number, name: string) => {
    setFormData(prev => {
      const newCategories = [...prev.costing_categories]
      newCategories[categoryIndex] = { ...newCategories[categoryIndex], name }
      return { ...prev, costing_categories: newCategories }
    })
  }
  const removeCategory = (categoryIndex: number) => {
    setFormData(prev => ({ ...prev, costing_categories: prev.costing_categories.filter((_, i) => i !== categoryIndex) }))
  }
  const addCostingActivity = (categoryIndex: number) => {
    setFormData(prev => {
      const newCategories = [...prev.costing_categories]
      newCategories[categoryIndex] = {
        ...newCategories[categoryIndex],
        activities: [...newCategories[categoryIndex].activities, { name: "", active: true, components: [] }]
      }
      return { ...prev, costing_categories: newCategories }
    })
  }
  const updateCostingActivity = (categoryIndex: number, activityIndex: number, field: keyof CostingActivity, value: string | boolean) => {
    setFormData(prev => {
      const newCategories = [...prev.costing_categories]
      const newActivities = [...newCategories[categoryIndex].activities]
      if (field === "name") {
        newActivities[activityIndex] = { ...newActivities[activityIndex], name: value as string }
      } else if (field === "active") {
        newActivities[activityIndex] = { ...newActivities[activityIndex], active: value as boolean }
      }
      newCategories[categoryIndex] = { ...newCategories[categoryIndex], activities: newActivities }
      return { ...prev, costing_categories: newCategories }
    })
  }
  const removeCostingActivity = (categoryIndex: number, activityIndex: number) => {
    setFormData(prev => {
      const newCategories = [...prev.costing_categories]
      newCategories[categoryIndex] = {
        ...newCategories[categoryIndex],
        activities: newCategories[categoryIndex].activities.filter((_, i) => i !== activityIndex)
      }
      return { ...prev, costing_categories: newCategories }
    })
  }
  const addCostingComponent = (categoryIndex: number, activityIndex: number) => {
    const defaultComponent = formData.abaques[0]?.component_name || ""
    setFormData(prev => {
      const newCategories = [...prev.costing_categories]
      const newActivities = [...newCategories[categoryIndex].activities]
      newActivities[activityIndex] = {
        ...newActivities[activityIndex],
        components: [...newActivities[activityIndex].components, { coefficient: 1, component_name: defaultComponent, complexity: "m" as ComplexityLevel, comment: "" }]
      }
      newCategories[categoryIndex] = { ...newCategories[categoryIndex], activities: newActivities }
      return { ...prev, costing_categories: newCategories }
    })
  }
  const updateCostingComponent = (categoryIndex: number, activityIndex: number, componentIndex: number, field: keyof CostingComponent, value: string | number) => {
    setFormData(prev => {
      const newCategories = [...prev.costing_categories]
      const newActivities = [...newCategories[categoryIndex].activities]
      const newComponents = [...newActivities[activityIndex].components]
      if (field === "coefficient") {
        newComponents[componentIndex] = { ...newComponents[componentIndex], coefficient: Number(value) || 1 }
      } else if (field === "component_name" || field === "comment") {
        newComponents[componentIndex] = { ...newComponents[componentIndex], [field]: value as string }
      } else if (field === "complexity") {
        newComponents[componentIndex] = { ...newComponents[componentIndex], complexity: value as ComplexityLevel }
      }
      newActivities[activityIndex] = { ...newActivities[activityIndex], components: newComponents }
      newCategories[categoryIndex] = { ...newCategories[categoryIndex], activities: newActivities }
      return { ...prev, costing_categories: newCategories }
    })
  }
  const removeCostingComponent = (categoryIndex: number, activityIndex: number, componentIndex: number) => {
    setFormData(prev => {
      const newCategories = [...prev.costing_categories]
      const newActivities = [...newCategories[categoryIndex].activities]
      newActivities[activityIndex] = {
        ...newActivities[activityIndex],
        components: newActivities[activityIndex].components.filter((_, i) => i !== componentIndex)
      }
      newCategories[categoryIndex] = { ...newCategories[categoryIndex], activities: newActivities }
      return { ...prev, costing_categories: newCategories }
    })
  }

  const baseProps = { formData, setFormData, loading }

  if (currentStep === 3) {
    return (
      <StepTransverse
        {...baseProps}
        addLevel={addLevel}
        removeLevel={removeLevel}
        addActivity={addActivity}
        updateActivity={updateActivity}
        removeActivity={removeActivity}
        validProfiles={validProfiles}
      />
    )
  }
  if (currentStep === 4) {
    return (
      <StepCosting
        {...baseProps}
        addCategory={addCategory}
        updateCategory={updateCategory}
        removeCategory={removeCategory}
        addCostingActivity={addCostingActivity}
        updateCostingActivity={updateCostingActivity}
        removeCostingActivity={removeCostingActivity}
        addCostingComponent={addCostingComponent}
        updateCostingComponent={updateCostingComponent}
        removeCostingComponent={removeCostingComponent}
      />
    )
  }
  return null
}
