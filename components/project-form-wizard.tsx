"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { createProject, updateProject } from "@/lib/projects"
import { ProjectFormData, Project, getProjectFormData } from "@/lib/types"
import { Loader2, Check, ChevronRight, ChevronLeft, Sparkles, Code, Rocket, Palette, FileText, Euro, Upload, CheckCircle2 } from "lucide-react"
import { StepTechLevel } from "@/components/wizard/step-tech-level"
import { StepProjectType } from "@/components/wizard/step-project-type"
import { StepDescription } from "@/components/wizard/step-description"
import { StepDesign } from "@/components/wizard/step-design"
import { StepBudget } from "@/components/wizard/step-budget"
import { StepFiles } from "@/components/wizard/step-files"
import { StepSummary } from "@/components/wizard/step-summary"

interface ProjectFormWizardProps {
  project?: Project | null
  onSuccess?: () => void
  onCancel?: () => void
}

type TechLevel = 'beginner' | 'intermediate' | 'advanced' | ''

export function ProjectFormWizard({ project, onSuccess, onCancel }: ProjectFormWizardProps) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const isEditing = !!project

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0)
  const [techLevel, setTechLevel] = useState<TechLevel>(project ? 'advanced' : '')

  const [formData, setFormData] = useState<ProjectFormData>(getProjectFormData(project))

  // Guided description for beginners
  const [guidedDescription, setGuidedDescription] = useState({
    whatIsIt: "",
    whoIsItFor: "",
    mainFeatures: "",
    inspiration: ""
  })

  const handleProjectTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      project_types: prev.project_types.includes(type)
        ? prev.project_types.filter(t => t !== type)
        : [...prev.project_types, type]
    }))
  }

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }))
  }

  const handlePlatformToggle = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }))
  }

  // Build description from guided answers
  const buildDescriptionFromGuided = () => {
    const parts = []
    if (guidedDescription.whatIsIt) {
      parts.push(guidedDescription.whatIsIt)
    }
    if (guidedDescription.whoIsItFor) {
      parts.push(`\n\n${t('projectWizard.targetAudienceLabel')}: ${guidedDescription.whoIsItFor}`)
    }
    if (guidedDescription.mainFeatures) {
      parts.push(`\n\n${t('projectWizard.featuresLabel')}: ${guidedDescription.mainFeatures}`)
    }
    if (guidedDescription.inspiration) {
      parts.push(`\n\n${t('projectWizard.inspirationLabel')}: ${guidedDescription.inspiration}`)
    }
    return parts.join('')
  }

  const handleSubmit = async () => {
    setError("")
    setSuccess(false)

    // Build final description for beginners
    const finalDescription = techLevel === 'beginner'
      ? buildDescriptionFromGuided()
      : formData.description

    const finalFormData = {
      ...formData,
      description: finalDescription,
      target_audience: techLevel === 'beginner' ? guidedDescription.whoIsItFor : formData.target_audience,
      features: techLevel === 'beginner' ? guidedDescription.mainFeatures : formData.features
    }

    if (!finalFormData.title.trim()) {
      setError(t('projects.errors.titleRequired'))
      return
    }

    if (finalFormData.project_types.length === 0) {
      setError(t('projects.errors.typeRequired'))
      return
    }

    if (!finalDescription.trim()) {
      setError(t('projects.errors.descriptionRequired'))
      return
    }

    setLoading(true)

    let submitError: Error | null = null

    if (isEditing && project) {
      const { error } = await updateProject(project.id, finalFormData)
      submitError = error
    } else {
      const { error } = await createProject(finalFormData)
      submitError = error
    }

    if (submitError) {
      setError(isEditing ? t('projects.errors.updateFailed') : t('projects.errors.createFailed'))
    } else {
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onSuccess?.()
      }, 1500)
    }

    setLoading(false)
  }

  // Define steps based on tech level and project type
  const getSteps = () => {
    const steps = [
      { id: 'techLevel', title: t('projectWizard.steps.techLevel'), icon: Sparkles },
      { id: 'projectType', title: t('projectWizard.steps.projectType'), icon: Code },
      { id: 'description', title: t('projectWizard.steps.description'), icon: FileText },
    ]

    // Add design step if relevant (web, mobile, desktop projects)
    const needsDesignStep = formData.project_types.some(type =>
      ['web', 'mobile', 'desktop'].includes(type)
    )
    if (needsDesignStep || formData.project_types.length === 0) {
      steps.push({ id: 'design', title: t('projectWizard.steps.design'), icon: Palette })
    }

    steps.push({ id: 'budget', title: t('projectWizard.steps.budget'), icon: Euro })

    // Simplified files step for non-beginners or optional for beginners
    if (techLevel !== 'beginner') {
      steps.push({ id: 'files', title: t('projectWizard.steps.files'), icon: Upload })
    }

    steps.push({ id: 'summary', title: t('projectWizard.steps.summary'), icon: CheckCircle2 })

    return steps
  }

  const steps = getSteps()
  const totalSteps = steps.length

  const canProceed = () => {
    switch (steps[currentStep]?.id) {
      case 'techLevel':
        return techLevel !== ''
      case 'projectType':
        return formData.project_types.length > 0 && formData.title.trim() !== ''
      case 'description':
        if (techLevel === 'beginner') {
          return guidedDescription.whatIsIt.trim() !== ''
        }
        return formData.description.trim() !== ''
      case 'design':
        return true // Optional
      case 'budget':
        return true // Optional
      case 'files':
        return true // Optional
      case 'summary':
        return true
      default:
        return true
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps - 1 && canProceed()) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepContent = () => {
    const stepId = steps[currentStep]?.id

    switch (stepId) {
      case 'techLevel':
        return (
          <StepTechLevel
            techLevel={techLevel}
            onSelect={setTechLevel}
          />
        )

      case 'projectType':
        return (
          <StepProjectType
            formData={formData}
            setFormData={setFormData}
            techLevel={techLevel}
            handleProjectTypeToggle={handleProjectTypeToggle}
            handlePlatformToggle={handlePlatformToggle}
          />
        )

      case 'description':
        return (
          <StepDescription
            formData={formData}
            setFormData={setFormData}
            guidedDescription={guidedDescription}
            setGuidedDescription={setGuidedDescription}
            techLevel={techLevel}
          />
        )

      case 'design':
        return (
          <StepDesign
            formData={formData}
            setFormData={setFormData}
            techLevel={techLevel}
            handleServiceToggle={handleServiceToggle}
          />
        )

      case 'budget':
        return (
          <StepBudget
            formData={formData}
            setFormData={setFormData}
            techLevel={techLevel}
          />
        )

      case 'files':
        return (
          <StepFiles
            formData={formData}
            setFormData={setFormData}
          />
        )

      case 'summary':
        return (
          <StepSummary
            formData={formData}
            techLevel={techLevel}
            guidedDescription={guidedDescription}
            buildDescriptionFromGuided={buildDescriptionFromGuided}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  index < currentStep
                    ? 'bg-primary text-white'
                    : index === currentStep
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <step.icon className="w-4 h-4" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-full h-1 mx-2 rounded ${
                  index < currentStep ? 'bg-primary' : 'bg-muted'
                }`} style={{ width: '40px' }} />
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-foreground/50">
          {currentStep + 1} / {totalSteps} - {steps[currentStep]?.title}
        </p>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-auto">
        {renderStepContent()}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t">
        <div>
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={loading}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {t('projectWizard.previous')}
            </Button>
          )}
          {currentStep === 0 && onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              {t('projects.form.cancel')}
            </Button>
          )}
        </div>

        <div>
          {currentStep < totalSteps - 1 ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={!canProceed() || loading}
              className="bg-primary hover:bg-primary/90"
            >
              {t('projectWizard.next')}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : success ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Rocket className="w-4 h-4 mr-2" />
              )}
              {success ? t('projectWizard.success') : (isEditing ? t('projects.form.update') : t('projectWizard.submit'))}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
