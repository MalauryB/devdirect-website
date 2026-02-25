"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useLanguage } from "@/contexts/language-context"
import { createProject, updateProject } from "@/lib/projects"
import { ProjectFormData, Project, ProjectFile } from "@/lib/types"
import { FileUpload } from "@/components/file-upload"
import { Loader2, Check, ChevronRight, ChevronLeft, Sparkles, Code, Rocket, Globe, Smartphone, Monitor, Cpu, Brain, HelpCircle, Lightbulb, Users, Palette, FileText, Euro, Clock, Upload, CheckCircle2 } from "lucide-react"

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

  const [formData, setFormData] = useState<ProjectFormData>({
    title: project?.title || "",
    project_types: project?.project_types || [],
    services: project?.services || [],
    platforms: project?.platforms || [],
    description: project?.description || "",
    features: project?.features || "",
    target_audience: project?.target_audience || "",
    has_existing_project: project?.has_existing_project || false,
    existing_technologies: project?.existing_technologies || "",
    needs_design: project?.needs_design || "",
    budget: project?.budget || "",
    deadline: project?.deadline || "",
    additional_info: project?.additional_info || "",
    specifications_file: project?.specifications_file || null,
    design_files: project?.design_files || null,
    brand_assets: project?.brand_assets || null,
    inspiration_images: project?.inspiration_images || null,
    other_documents: project?.other_documents || null
  })

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

  const projectTypeOptions = [
    { id: "web", label: t('projects.types.web'), icon: Globe, description: t('projectWizard.typeDescriptions.web') },
    { id: "mobile", label: t('projects.types.mobile'), icon: Smartphone, description: t('projectWizard.typeDescriptions.mobile') },
    { id: "desktop", label: t('projects.types.desktop'), icon: Monitor, description: t('projectWizard.typeDescriptions.desktop') },
    { id: "iot", label: t('projects.types.iot'), icon: Cpu, description: t('projectWizard.typeDescriptions.iot') },
    { id: "ai", label: t('projects.types.ai'), icon: Brain, description: t('projectWizard.typeDescriptions.ai') },
    { id: "other", label: t('projects.types.other'), icon: HelpCircle, description: t('projectWizard.typeDescriptions.other') }
  ]

  const services = [
    { id: "development", label: t('projects.services.development') },
    { id: "design", label: t('projects.services.design') },
    { id: "consulting", label: t('projects.services.consulting') },
    { id: "testing", label: t('projects.services.testing') },
    { id: "deployment", label: t('projects.services.deployment') },
    { id: "maintenance", label: t('projects.services.maintenance') }
  ]

  const renderStepContent = () => {
    const stepId = steps[currentStep]?.id

    switch (stepId) {
      case 'techLevel':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">{t('projectWizard.techLevel.title')}</h2>
              <p className="text-foreground/60">{t('projectWizard.techLevel.subtitle')}</p>
            </div>
            <div className="grid gap-4">
              {[
                {
                  value: 'beginner',
                  title: t('projectWizard.techLevel.beginner.title'),
                  description: t('projectWizard.techLevel.beginner.description'),
                  icon: Lightbulb
                },
                {
                  value: 'intermediate',
                  title: t('projectWizard.techLevel.intermediate.title'),
                  description: t('projectWizard.techLevel.intermediate.description'),
                  icon: Users
                },
                {
                  value: 'advanced',
                  title: t('projectWizard.techLevel.advanced.title'),
                  description: t('projectWizard.techLevel.advanced.description'),
                  icon: Code
                }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTechLevel(option.value as TechLevel)}
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

      case 'projectType':
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

      case 'description':
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

      case 'design':
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

      case 'budget':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">{t('projectWizard.budget.title')}</h2>
              <p className="text-foreground/60">{t('projectWizard.budget.subtitle')}</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Euro className="w-4 h-4" />
                  {t('projects.form.budget')}
                </Label>
                <div className="grid gap-2">
                  {[
                    { value: 'small', label: t('projects.budget.small'), hint: techLevel === 'beginner' ? t('projectWizard.budget.smallHint') : '' },
                    { value: 'medium', label: t('projects.budget.medium'), hint: techLevel === 'beginner' ? t('projectWizard.budget.mediumHint') : '' },
                    { value: 'large', label: t('projects.budget.large'), hint: techLevel === 'beginner' ? t('projectWizard.budget.largeHint') : '' },
                    { value: 'xlarge', label: t('projects.budget.xlarge'), hint: techLevel === 'beginner' ? t('projectWizard.budget.xlargeHint') : '' },
                    { value: 'flexible', label: t('projects.budget.flexible'), hint: '' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, budget: option.value })}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${
                        formData.budget === option.value
                          ? 'border-primary bg-muted/50'
                          : 'border-border hover:border-border bg-white'
                      }`}
                    >
                      <span className="font-medium text-foreground">{option.label}</span>
                      {option.hint && (
                        <span className="text-sm text-foreground/50">{option.hint}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {t('projects.form.deadline')}
                </Label>
                <div className="grid gap-2">
                  {[
                    { value: 'urgent', label: t('projects.deadline.urgent') },
                    { value: 'short', label: t('projects.deadline.short') },
                    { value: 'medium', label: t('projects.deadline.medium') },
                    { value: 'long', label: t('projects.deadline.long') },
                    { value: 'flexible', label: t('projects.deadline.flexible') }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, deadline: option.value })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        formData.deadline === option.value
                          ? 'border-primary bg-muted/50'
                          : 'border-border hover:border-border bg-white'
                      }`}
                    >
                      <span className="font-medium text-foreground">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 'files':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">{t('projectWizard.files.title')}</h2>
              <p className="text-foreground/60">{t('projectWizard.files.subtitle')}</p>
            </div>

            <div className="space-y-6">
              <FileUpload
                bucket="projects"
                folder="specifications"
                accept="documents"
                value={formData.specifications_file}
                onChange={(file) => setFormData({ ...formData, specifications_file: file as ProjectFile | null })}
                label={t('projects.form.specificationsFile')}
                description={t('projects.form.specificationsFileDesc')}
              />
              <FileUpload
                bucket="projects"
                folder="designs"
                accept="all"
                multiple
                value={formData.design_files}
                onChange={(files) => setFormData({ ...formData, design_files: files as ProjectFile[] | null })}
                label={t('projects.form.designFiles')}
                description={t('projects.form.designFilesDesc')}
              />
              <FileUpload
                bucket="projects"
                folder="other"
                accept="all"
                multiple
                value={formData.other_documents}
                onChange={(files) => setFormData({ ...formData, other_documents: files as ProjectFile[] | null })}
                label={t('projects.form.otherDocuments')}
                description={t('projects.form.otherDocumentsDesc')}
              />
            </div>
          </div>
        )

      case 'summary':
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
