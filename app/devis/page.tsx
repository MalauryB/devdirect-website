"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, ArrowRight, Send, Loader2, Check, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { createProject } from "@/lib/projects"
import { ProjectFormData } from "@/lib/types"

const DEVIS_STORAGE_KEY = "pending_devis_project"

type AuthMode = "login" | "register" | "forgot"

export default function DevisPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { user, signIn, signUp, resetPassword } = useAuth()

  const [step, setStep] = useState(1)
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

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(DEVIS_STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setFormData(parsed)
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, [])

  // If user is already logged in and we have a pending project, transfer it
  useEffect(() => {
    const transferPendingProject = async () => {
      if (user && step === 2) {
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
  }, [user, step, router, t])

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

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.title.trim()) {
      setError(t('projects.errors.titleRequired'))
      return
    }

    if (formData.project_types.length === 0) {
      setError(t('projects.errors.typeRequired'))
      return
    }

    if (!formData.description.trim()) {
      setError(t('projects.errors.descriptionRequired'))
      return
    }

    // Save to localStorage and go to step 2
    localStorage.setItem(DEVIS_STORAGE_KEY, JSON.stringify(formData))
    setStep(2)
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
        // If success, the useEffect will handle transfer
      } else if (authMode === "register") {
        const { error, data } = await signUp(email, password)
        if (error) {
          setError(error.message)
        } else if (data?.user && !data.user.identities?.length) {
          // User already exists
          setError("Un compte existe déjà avec cet email")
        } else if (data?.session) {
          // User is automatically logged in (no email confirmation required)
          // The useEffect will handle the transfer
        } else {
          // Email confirmation required
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

  const projectTypes = [
    { id: "web", label: t('projects.types.web') },
    { id: "mobile", label: t('projects.types.mobile') },
    { id: "desktop", label: t('projects.types.desktop') },
    { id: "iot", label: t('projects.types.iot') },
    { id: "ai", label: t('projects.types.ai') },
    { id: "other", label: t('projects.types.other') }
  ]

  const services = [
    { id: "development", label: t('projects.services.development') },
    { id: "design", label: t('projects.services.design') },
    { id: "consulting", label: t('projects.services.consulting') },
    { id: "testing", label: t('projects.services.testing') },
    { id: "deployment", label: t('projects.services.deployment') },
    { id: "maintenance", label: t('projects.services.maintenance') },
    { id: "training", label: t('projects.services.training') },
    { id: "seo", label: t('projects.services.seo') }
  ]

  const platforms = [
    { id: "web", label: "Web" },
    { id: "ios", label: "iOS" },
    { id: "android", label: "Android" },
    { id: "windows", label: "Windows" },
    { id: "macos", label: "macOS" },
    { id: "linux", label: "Linux" },
    { id: "embedded", label: t('projects.platforms.embedded') }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => step === 1 ? router.push("/") : setStep(1)}
              className="flex items-center gap-2 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              {step === 1 ? "Retour à l'accueil" : "Retour au formulaire"}
            </Button>
            <h1 className="text-base md:text-3xl font-bold logo-cubic text-black">{t('name')}</h1>
          </div>
        </div>
      </header>

      {/* Progress indicator */}
      <div className="container mx-auto px-4 pt-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-foreground' : 'text-foreground/40'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-gray-900 text-white' : 'bg-gray-200 text-foreground/60'
              }`}>
                {step > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span className="text-sm font-medium hidden sm:block">Votre projet</span>
            </div>
            <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-gray-900' : 'bg-gray-200'}`} />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-foreground' : 'text-foreground/40'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-gray-900 text-white' : 'bg-gray-200 text-foreground/60'
              }`}>
                {success ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <span className="text-sm font-medium hidden sm:block">Connexion</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Project Form */}
          {step === 1 && (
            <>
              <div className="mb-10">
                <h1 className="text-3xl font-bold mb-3">Demande de Devis</h1>
                <p className="text-foreground/60">
                  Décrivez votre projet en détail pour recevoir un devis personnalisé.
                </p>
              </div>

              <form onSubmit={handleStep1Submit} className="space-y-10">
                {/* Titre du projet */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{t('projects.form.title')} *</h3>
                    <p className="text-xs text-foreground/50 mt-0.5">{t('projects.form.titleDesc')}</p>
                  </div>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={t('projects.form.titlePlaceholder')}
                    className="border-gray-200 focus:border-gray-400"
                  />
                </div>

                {/* Type de projet */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{t('projects.form.projectType')} *</h3>
                    <p className="text-xs text-foreground/50 mt-0.5">{t('projects.form.projectTypeDesc')}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {projectTypes.map((type) => (
                      <label
                        key={type.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors bg-white ${
                          formData.project_types.includes(type.id)
                            ? 'border-gray-900'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Checkbox
                          checked={formData.project_types.includes(type.id)}
                          onCheckedChange={() => handleProjectTypeToggle(type.id)}
                          className="data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900"
                        />
                        <span className="text-sm text-foreground">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Services demandés */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{t('projects.form.services')}</h3>
                    <p className="text-xs text-foreground/50 mt-0.5">{t('projects.form.servicesDesc')}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {services.map((service) => (
                      <label
                        key={service.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors bg-white ${
                          formData.services.includes(service.id)
                            ? 'border-gray-900'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Checkbox
                          checked={formData.services.includes(service.id)}
                          onCheckedChange={() => handleServiceToggle(service.id)}
                          className="data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900"
                        />
                        <span className="text-sm text-foreground">{service.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Plateformes */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{t('projects.form.platforms')}</h3>
                    <p className="text-xs text-foreground/50 mt-0.5">{t('projects.form.platformsDesc')}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {platforms.map((platform) => (
                      <label
                        key={platform.id}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
                          formData.platforms.includes(platform.id)
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <Checkbox
                          checked={formData.platforms.includes(platform.id)}
                          onCheckedChange={() => handlePlatformToggle(platform.id)}
                          className="hidden"
                        />
                        <span className="text-sm">{platform.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Description du projet */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{t('projects.form.description')}</h3>
                    <p className="text-xs text-foreground/50 mt-0.5">{t('projects.form.descriptionDesc')}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="description" className="text-sm text-foreground/70">{t('projects.form.generalDescription')} *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder={t('projects.form.descriptionPlaceholder')}
                        rows={4}
                        className="border-gray-200 focus:border-gray-400 resize-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="features" className="text-sm text-foreground/70">{t('projects.form.features')}</Label>
                      <Textarea
                        id="features"
                        value={formData.features}
                        onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                        placeholder={t('projects.form.featuresPlaceholder')}
                        rows={3}
                        className="border-gray-200 focus:border-gray-400 resize-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="targetAudience" className="text-sm text-foreground/70">{t('projects.form.targetAudience')}</Label>
                      <Input
                        id="targetAudience"
                        value={formData.target_audience}
                        onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                        placeholder={t('projects.form.targetAudiencePlaceholder')}
                        className="border-gray-200 focus:border-gray-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Projet existant */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{t('projects.form.existingProject')}</h3>
                    <p className="text-xs text-foreground/50 mt-0.5">{t('projects.form.existingProjectDesc')}</p>
                  </div>
                  <RadioGroup
                    value={formData.has_existing_project ? "yes" : "no"}
                    onValueChange={(value) => setFormData({ ...formData, has_existing_project: value === "yes" })}
                    className="flex gap-4"
                  >
                    <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors bg-white ${
                      !formData.has_existing_project ? 'border-gray-900' : 'border-gray-200'
                    }`}>
                      <RadioGroupItem value="no" id="existing-no" className="border-gray-300" />
                      <span className="text-sm">{t('projects.form.newProject')}</span>
                    </label>
                    <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors bg-white ${
                      formData.has_existing_project ? 'border-gray-900' : 'border-gray-200'
                    }`}>
                      <RadioGroupItem value="yes" id="existing-yes" className="border-gray-300" />
                      <span className="text-sm">{t('projects.form.hasExisting')}</span>
                    </label>
                  </RadioGroup>
                  {formData.has_existing_project && (
                    <div className="space-y-1.5 pt-2">
                      <Label htmlFor="existingTechnologies" className="text-sm text-foreground/70">{t('projects.form.existingTech')}</Label>
                      <Textarea
                        id="existingTechnologies"
                        value={formData.existing_technologies}
                        onChange={(e) => setFormData({ ...formData, existing_technologies: e.target.value })}
                        placeholder={t('projects.form.existingTechPlaceholder')}
                        rows={2}
                        className="border-gray-200 focus:border-gray-400 resize-none"
                      />
                    </div>
                  )}
                </div>

                {/* Design */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{t('projects.form.designTitle')}</h3>
                    <p className="text-xs text-foreground/50 mt-0.5">{t('projects.form.designDesc')}</p>
                  </div>
                  <RadioGroup
                    value={formData.needs_design}
                    onValueChange={(value) => setFormData({ ...formData, needs_design: value })}
                    className="flex flex-wrap gap-2"
                  >
                    {[
                      { value: "yes", label: t('projects.form.needsDesignYes') },
                      { value: "partial", label: t('projects.form.needsDesignPartial') },
                      { value: "no", label: t('projects.form.needsDesignNo') }
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors bg-white ${
                          formData.needs_design === option.value ? 'border-gray-900' : 'border-gray-200'
                        }`}
                      >
                        <RadioGroupItem value={option.value} className="border-gray-300" />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                {/* Budget et délais */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{t('projects.form.budgetTitle')}</h3>
                    <p className="text-xs text-foreground/50 mt-0.5">{t('projects.form.budgetDesc')}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm text-foreground/70">{t('projects.form.budget')}</Label>
                      <Select
                        value={formData.budget}
                        onValueChange={(value) => setFormData({ ...formData, budget: value })}
                      >
                        <SelectTrigger className="border-gray-200 focus:border-gray-400">
                          <SelectValue placeholder={t('projects.form.budgetPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">{t('projects.budget.small')}</SelectItem>
                          <SelectItem value="medium">{t('projects.budget.medium')}</SelectItem>
                          <SelectItem value="large">{t('projects.budget.large')}</SelectItem>
                          <SelectItem value="xlarge">{t('projects.budget.xlarge')}</SelectItem>
                          <SelectItem value="flexible">{t('projects.budget.flexible')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm text-foreground/70">{t('projects.form.deadline')}</Label>
                      <Select
                        value={formData.deadline}
                        onValueChange={(value) => setFormData({ ...formData, deadline: value })}
                      >
                        <SelectTrigger className="border-gray-200 focus:border-gray-400">
                          <SelectValue placeholder={t('projects.form.deadlinePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="urgent">{t('projects.deadline.urgent')}</SelectItem>
                          <SelectItem value="short">{t('projects.deadline.short')}</SelectItem>
                          <SelectItem value="medium">{t('projects.deadline.medium')}</SelectItem>
                          <SelectItem value="long">{t('projects.deadline.long')}</SelectItem>
                          <SelectItem value="flexible">{t('projects.deadline.flexible')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Fichiers joints - Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{t('projects.form.filesTitle')}</h3>
                    <p className="text-xs text-foreground/50 mt-0.5">{t('projects.form.filesDesc')}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-foreground/70">
                      📎 Vous pourrez joindre des fichiers (cahier des charges, maquettes, logos, etc.) après avoir créé votre compte et soumis votre demande.
                    </p>
                  </div>
                </div>

                {/* Informations additionnelles */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{t('projects.form.additionalTitle')}</h3>
                    <p className="text-xs text-foreground/50 mt-0.5">{t('projects.form.additionalDesc')}</p>
                  </div>
                  <Textarea
                    value={formData.additional_info}
                    onChange={(e) => setFormData({ ...formData, additional_info: e.target.value })}
                    placeholder={t('projects.form.additionalPlaceholder')}
                    rows={3}
                    className="border-gray-200 focus:border-gray-400 resize-none"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    {error}
                  </p>
                )}

                {/* Submit */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    Continuer
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            </>
          )}

          {/* Step 2: Auth */}
          {step === 2 && (
            <>
              <div className="mb-10 text-center">
                <h1 className="text-3xl font-bold mb-3">
                  {success ? "Demande envoyée !" : "Connectez-vous pour finaliser"}
                </h1>
                <p className="text-foreground/60">
                  {success
                    ? "Votre demande de devis a été enregistrée. Vous allez être redirigé vers votre espace."
                    : "Créez un compte ou connectez-vous pour suivre votre demande de devis."
                  }
                </p>
              </div>

              {success ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-sm text-foreground/60">Redirection en cours...</p>
                </div>
              ) : (
                <div className="max-w-md mx-auto">
                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-sm text-foreground/70">{t('auth.email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t('auth.emailPlaceholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="border-gray-200 focus:border-gray-400"
                      />
                    </div>

                    {authMode !== "forgot" && (
                      <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-sm text-foreground/70">{t('auth.password')}</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder={t('auth.passwordPlaceholder')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            className="border-gray-200 focus:border-gray-400 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {authMode === "register" && (
                      <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword" className="text-sm text-foreground/70">{t('auth.confirmPassword')}</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder={t('auth.confirmPasswordPlaceholder')}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                            className="border-gray-200 focus:border-gray-400 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {error && (
                      <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                        {error}
                      </p>
                    )}

                    {authSuccess && (
                      <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                        {authSuccess}
                      </p>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                      disabled={loading}
                    >
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {authMode === "login" && t('auth.login.button')}
                      {authMode === "register" && t('auth.register.button')}
                      {authMode === "forgot" && t('auth.forgot.button')}
                    </Button>

                    {authMode === "login" && (
                      <button
                        type="button"
                        onClick={() => { setAuthMode("forgot"); setError(""); setAuthSuccess(""); }}
                        className="text-sm text-foreground/50 hover:text-foreground w-full text-center"
                      >
                        {t('auth.login.forgotPassword')}
                      </button>
                    )}

                    <p className="text-sm text-center text-foreground/60 pt-2">
                      {authMode === "login" && t('auth.login.noAccount')}
                      {authMode === "register" && t('auth.register.hasAccount')}
                      {authMode === "forgot" && t('auth.forgot.rememberPassword')}
                      {" "}
                      <button
                        type="button"
                        onClick={() => {
                          if (authMode === "forgot") {
                            setAuthMode("login")
                          } else {
                            setAuthMode(authMode === "login" ? "register" : "login")
                          }
                          setError("")
                          setAuthSuccess("")
                        }}
                        className="text-gray-900 hover:underline font-medium"
                      >
                        {authMode === "login" && t('auth.login.createAccount')}
                        {authMode === "register" && t('auth.register.login')}
                        {authMode === "forgot" && t('auth.forgot.backToLogin')}
                      </button>
                    </p>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
