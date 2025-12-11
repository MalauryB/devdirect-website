"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Check, Eye, EyeOff, Sparkles, Code, Lightbulb, Users, Globe, Smartphone, Monitor, Cpu, Brain, HelpCircle, FileText, Palette, Euro, Clock, CheckCircle2, ChevronRight, ChevronLeft, Rocket } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { createProject } from "@/lib/projects"
import { ProjectFormData } from "@/lib/types"
import { Textarea } from "@/components/ui/textarea"

const DEVIS_STORAGE_KEY = "pending_devis_project"

type AuthMode = "login" | "register" | "forgot"
type TechLevel = 'beginner' | 'intermediate' | 'advanced' | ''

export default function DevisPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { user, signIn, signUp, resetPassword } = useAuth()

  const [mainStep, setMainStep] = useState(1) // 1 = project form, 2 = auth
  const [wizardStep, setWizardStep] = useState(0)
  const [techLevel, setTechLevel] = useState<TechLevel>('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  // Auth state
  const [authMode, setAuthMode] = useState<AuthMode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [authSuccess, setAuthSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Project form state
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    project_types: [],
    services: [],
    platforms: [],
    description: "",
    features: "",
    target_audience: "",
    has_existing_project: false,
    existing_technologies: "",
    needs_design: "",
    budget: "",
    deadline: "",
    additional_info: ""
  })

  // Guided description for beginners
  const [guidedDescription, setGuidedDescription] = useState({
    whatIsIt: "",
    whoIsItFor: "",
    mainFeatures: "",
    inspiration: ""
  })

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(DEVIS_STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setFormData(parsed)
        if (parsed.title) {
          setTechLevel('advanced') // Skip tech level if already has data
          setWizardStep(1)
        }
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, [])

  // If user is already logged in and we have a pending project, transfer it
  useEffect(() => {
    const transferPendingProject = async () => {
      if (user && mainStep === 2) {
        const saved = localStorage.getItem(DEVIS_STORAGE_KEY)
        if (saved) {
          setLoading(true)
          try {
            const projectData = JSON.parse(saved) as ProjectFormData
            const { error: createError } = await createProject(projectData)
            if (!createError) {
              localStorage.removeItem(DEVIS_STORAGE_KEY)
              setSuccess(true)
              setTimeout(() => {
                router.push("/dashboard?section=projects")
              }, 2000)
            } else {
              setError(t('projects.errors.createFailed'))
            }
          } catch {
            setError(t('projects.errors.createFailed'))
          }
          setLoading(false)
        }
      }
    }
    transferPendingProject()
  }, [user, mainStep, router, t])

  const handleProjectTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      project_types: prev.project_types.includes(type)
        ? prev.project_types.filter(t => t !== type)
        : [...prev.project_types, type]
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

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
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

  const handleProjectSubmit = () => {
    setError("")

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

    // Save to localStorage and go to auth step
    localStorage.setItem(DEVIS_STORAGE_KEY, JSON.stringify(finalFormData))
    setMainStep(2)
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setAuthSuccess("")

    if (!email) {
      setError(t('auth.errors.emailRequired'))
      return
    }

    if (authMode !== "forgot" && !password) {
      setError(t('auth.errors.fieldsRequired'))
      return
    }

    if (authMode === "register" && password !== confirmPassword) {
      setError(t('auth.errors.passwordMismatch'))
      return
    }

    if (authMode !== "forgot" && password.length < 6) {
      setError(t('auth.errors.passwordTooShort'))
      return
    }

    setLoading(true)

    try {
      if (authMode === "login") {
        const { error } = await signIn(email, password)
        if (error) {
          setError(t('auth.errors.invalidCredentials'))
        }
      } else if (authMode === "register") {
        const { error, data } = await signUp(email, password)
        if (error) {
          setError(error.message)
        } else if (data?.user && !data.user.identities?.length) {
          setError("Un compte existe déjà avec cet email")
        } else if (data?.session) {
          // User is automatically logged in
        } else {
          setAuthSuccess(t('auth.success.checkEmail'))
        }
      } else if (authMode === "forgot") {
        const { error } = await resetPassword(email)
        if (error) {
          setError(error.message)
        } else {
          setAuthSuccess(t('auth.success.resetEmail'))
        }
      }
    } catch {
      setError(t('auth.errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  // Wizard steps configuration
  const getWizardSteps = () => {
    const steps = [
      { id: 'techLevel', title: t('projectWizard.steps.techLevel'), icon: Sparkles },
      { id: 'projectType', title: t('projectWizard.steps.projectType'), icon: Code },
      { id: 'description', title: t('projectWizard.steps.description'), icon: FileText },
    ]

    const needsDesignStep = formData.project_types.some(type =>
      ['web', 'mobile', 'desktop'].includes(type)
    )
    if (needsDesignStep || formData.project_types.length === 0) {
      steps.push({ id: 'design', title: t('projectWizard.steps.design'), icon: Palette })
    }

    steps.push({ id: 'budget', title: t('projectWizard.steps.budget'), icon: Euro })
    steps.push({ id: 'summary', title: t('projectWizard.steps.summary'), icon: CheckCircle2 })

    return steps
  }

  const wizardSteps = getWizardSteps()
  const totalWizardSteps = wizardSteps.length

  const canProceedWizard = () => {
    switch (wizardSteps[wizardStep]?.id) {
      case 'techLevel':
        return techLevel !== ''
      case 'projectType':
        return formData.project_types.length > 0 && formData.title.trim() !== ''
      case 'description':
        if (techLevel === 'beginner') {
          return guidedDescription.whatIsIt.trim() !== ''
        }
        return formData.description.trim() !== ''
      default:
        return true
    }
  }

  const nextWizardStep = () => {
    if (wizardStep < totalWizardSteps - 1 && canProceedWizard()) {
      setWizardStep(wizardStep + 1)
    }
  }

  const prevWizardStep = () => {
    if (wizardStep > 0) {
      setWizardStep(wizardStep - 1)
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

  const renderWizardContent = () => {
    const stepId = wizardSteps[wizardStep]?.id

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
                { value: 'beginner', title: t('projectWizard.techLevel.beginner.title'), description: t('projectWizard.techLevel.beginner.description'), icon: Lightbulb },
                { value: 'intermediate', title: t('projectWizard.techLevel.intermediate.title'), description: t('projectWizard.techLevel.intermediate.description'), icon: Users },
                { value: 'advanced', title: t('projectWizard.techLevel.advanced.title'), description: t('projectWizard.techLevel.advanced.description'), icon: Code }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTechLevel(option.value as TechLevel)}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                    techLevel === option.value
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    techLevel === option.value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
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

            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('projects.form.title')} *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t('projects.form.titlePlaceholder')}
                className="border-gray-200 focus:border-gray-400"
              />
              {techLevel === 'beginner' && (
                <p className="text-xs text-foreground/50">{t('projectWizard.projectType.titleHint')}</p>
              )}
            </div>

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
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      formData.project_types.includes(type.id) ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
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
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
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
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center">1</span>
                    {t('projectWizard.description.whatIsIt')} *
                  </Label>
                  <Textarea
                    value={guidedDescription.whatIsIt}
                    onChange={(e) => setGuidedDescription({ ...guidedDescription, whatIsIt: e.target.value })}
                    placeholder={t('projectWizard.description.whatIsItPlaceholder')}
                    rows={3}
                    className="border-gray-200 focus:border-gray-400 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center">2</span>
                    {t('projectWizard.description.whoIsItFor')}
                  </Label>
                  <Textarea
                    value={guidedDescription.whoIsItFor}
                    onChange={(e) => setGuidedDescription({ ...guidedDescription, whoIsItFor: e.target.value })}
                    placeholder={t('projectWizard.description.whoIsItForPlaceholder')}
                    rows={2}
                    className="border-gray-200 focus:border-gray-400 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center">3</span>
                    {t('projectWizard.description.mainFeatures')}
                  </Label>
                  <Textarea
                    value={guidedDescription.mainFeatures}
                    onChange={(e) => setGuidedDescription({ ...guidedDescription, mainFeatures: e.target.value })}
                    placeholder={t('projectWizard.description.mainFeaturesPlaceholder')}
                    rows={3}
                    className="border-gray-200 focus:border-gray-400 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center">4</span>
                    {t('projectWizard.description.inspiration')}
                  </Label>
                  <Textarea
                    value={guidedDescription.inspiration}
                    onChange={(e) => setGuidedDescription({ ...guidedDescription, inspiration: e.target.value })}
                    placeholder={t('projectWizard.description.inspirationPlaceholder')}
                    rows={2}
                    className="border-gray-200 focus:border-gray-400 resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('projects.form.generalDescription')} *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t('projects.form.descriptionPlaceholder')}
                    rows={5}
                    className="border-gray-200 focus:border-gray-400 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('projects.form.features')}</Label>
                  <Textarea
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    placeholder={t('projects.form.featuresPlaceholder')}
                    rows={3}
                    className="border-gray-200 focus:border-gray-400 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('projects.form.targetAudience')}</Label>
                  <Input
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    placeholder={t('projects.form.targetAudiencePlaceholder')}
                    className="border-gray-200 focus:border-gray-400"
                  />
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
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      formData.needs_design === option.value ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
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
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
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
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
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
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
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

      case 'summary':
        const finalDesc = techLevel === 'beginner' ? buildDescriptionFromGuided() : formData.description
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">{t('projectWizard.summary.title')}</h2>
              <p className="text-foreground/60">{t('projectWizard.summary.subtitle')}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
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
                <p className="text-foreground whitespace-pre-wrap text-sm">{finalDesc || '-'}</p>
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => {
                if (mainStep === 2) {
                  setMainStep(1)
                } else if (wizardStep > 0) {
                  prevWizardStep()
                } else {
                  router.push("/")
                }
              }}
              className="flex items-center gap-2 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              {mainStep === 2 ? "Retour au formulaire" : wizardStep === 0 ? "Retour à l'accueil" : "Précédent"}
            </Button>
            <h1 className="text-base md:text-3xl font-bold logo-cubic text-black">{t('name')}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-12">
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Project Form Wizard */}
          {mainStep === 1 && (
            <>
              {/* Wizard progress - simplified */}
              <div className="mb-8">
                <div className="flex items-center gap-1 mb-2">
                  {wizardSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        index <= wizardStep ? 'bg-gray-900' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-center text-sm text-foreground/50">
                  {wizardStep + 1} / {totalWizardSteps} - {wizardSteps[wizardStep]?.title}
                </p>
              </div>

              {/* Wizard content */}
              <div className="min-h-[400px]">
                {renderWizardContent()}
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
                  {wizardStep > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevWizardStep}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      {t('projectWizard.previous')}
                    </Button>
                  )}
                </div>

                <div>
                  {wizardStep < totalWizardSteps - 1 ? (
                    <Button
                      type="button"
                      onClick={nextWizardStep}
                      disabled={!canProceedWizard()}
                      className="bg-gray-900 hover:bg-gray-800"
                    >
                      {t('projectWizard.next')}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleProjectSubmit}
                      className="bg-gray-900 hover:bg-gray-800"
                    >
                      <Rocket className="w-4 h-4 mr-2" />
                      Continuer
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Step 2: Authentication */}
          {mainStep === 2 && (
            <>
              {success ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Projet envoyé !</h2>
                  <p className="text-foreground/60">Redirection vers votre tableau de bord...</p>
                </div>
              ) : (
                <>
                  <div className="mb-10 text-center">
                    <h1 className="text-3xl font-bold mb-3">
                      {authMode === "login" ? "Connectez-vous" : authMode === "register" ? "Créez votre compte" : "Mot de passe oublié"}
                    </h1>
                    <p className="text-foreground/60">
                      {authMode === "login"
                        ? "Pour envoyer votre demande et suivre son avancement"
                        : authMode === "register"
                        ? "Créez un compte pour envoyer votre demande"
                        : "Entrez votre email pour recevoir un lien de réinitialisation"
                      }
                    </p>
                  </div>

                  <form onSubmit={handleAuthSubmit} className="max-w-md mx-auto space-y-6">
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.com"
                        disabled={loading}
                        className="border-gray-200 focus:border-gray-400"
                      />
                    </div>

                    {authMode !== "forgot" && (
                      <div className="space-y-1.5">
                        <Label htmlFor="password">Mot de passe</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            disabled={loading}
                            className="border-gray-200 focus:border-gray-400 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {authMode === "register" && (
                      <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            disabled={loading}
                            className="border-gray-200 focus:border-gray-400 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {error && (
                      <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
                    )}

                    {authSuccess && (
                      <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">{authSuccess}</p>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gray-900 hover:bg-gray-800"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      {authMode === "login"
                        ? "Se connecter"
                        : authMode === "register"
                        ? "Créer mon compte"
                        : "Envoyer le lien"
                      }
                    </Button>

                    <div className="text-center space-y-2">
                      {authMode === "login" && (
                        <>
                          <button
                            type="button"
                            onClick={() => setAuthMode("forgot")}
                            className="text-sm text-foreground/60 hover:text-foreground"
                          >
                            Mot de passe oublié ?
                          </button>
                          <p className="text-sm text-foreground/60">
                            Pas encore de compte ?{" "}
                            <button
                              type="button"
                              onClick={() => setAuthMode("register")}
                              className="text-foreground font-medium hover:underline"
                            >
                              Créer un compte
                            </button>
                          </p>
                        </>
                      )}
                      {authMode === "register" && (
                        <p className="text-sm text-foreground/60">
                          Déjà un compte ?{" "}
                          <button
                            type="button"
                            onClick={() => setAuthMode("login")}
                            className="text-foreground font-medium hover:underline"
                          >
                            Se connecter
                          </button>
                        </p>
                      )}
                      {authMode === "forgot" && (
                        <button
                          type="button"
                          onClick={() => setAuthMode("login")}
                          className="text-sm text-foreground/60 hover:text-foreground"
                        >
                          Retour à la connexion
                        </button>
                      )}
                    </div>
                  </form>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
