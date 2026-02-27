import type { QuoteFormData, QuoteProfile, QuoteAbaque, QuoteStatus, TransverseActivity, TransverseActivityType, CostingActivity, CostingComponent, ComplexityLevel } from "@/lib/types"

export interface QuoteStepProps {
  formData: QuoteFormData
  setFormData: React.Dispatch<React.SetStateAction<QuoteFormData>>
  loading: boolean
}

// Step 1 handlers
export interface Step1Handlers {
  addProfile: () => void
  updateProfile: (index: number, field: keyof QuoteProfile, value: string | number) => void
  removeProfile: (index: number) => void
}

// Step 2 handlers
export interface Step2Handlers {
  addAbaque: () => void
  updateAbaque: (index: number, field: keyof QuoteAbaque, value: string | number) => void
  removeAbaque: (index: number) => void
  validProfiles: QuoteProfile[]
}

// Step 3 handlers
export interface Step3Handlers {
  addLevel: () => void
  removeLevel: (levelIndex: number) => void
  addActivity: (levelIndex: number) => void
  updateActivity: (levelIndex: number, activityIndex: number, field: keyof TransverseActivity, value: string | number) => void
  removeActivity: (levelIndex: number, activityIndex: number) => void
  validProfiles: QuoteProfile[]
}

// Step 4 handlers
export interface Step4Handlers {
  addCategory: () => void
  updateCategory: (categoryIndex: number, name: string) => void
  removeCategory: (categoryIndex: number) => void
  addCostingActivity: (categoryIndex: number) => void
  updateCostingActivity: (categoryIndex: number, activityIndex: number, field: keyof CostingActivity, value: string | boolean) => void
  removeCostingActivity: (categoryIndex: number, activityIndex: number) => void
  addCostingComponent: (categoryIndex: number, activityIndex: number) => void
  updateCostingComponent: (categoryIndex: number, activityIndex: number, componentIndex: number, field: keyof CostingComponent, value: string | number) => void
  removeCostingComponent: (categoryIndex: number, activityIndex: number, componentIndex: number) => void
}
