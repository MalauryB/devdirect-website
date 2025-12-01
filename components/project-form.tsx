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
import { createProject } from "@/lib/projects"
import { ProjectFormData } from "@/lib/types"
import { Loader2, Check, Send } from "lucide-react"

interface ProjectFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProjectForm({ onSuccess, onCancel }: ProjectFormProps) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<ProjectFormData>({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (formData.project_types.length === 0) {
      setError(t('projects.errors.typeRequired'))
      return
    }

    if (!formData.description.trim()) {
      setError(t('projects.errors.descriptionRequired'))
      return
    }

    setLoading(true)

    const { error: createError } = await createProject(formData)

    if (createError) {
      setError(t('projects.errors.createFailed'))
    } else {
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onSuccess?.()
      }, 1500)
    }

    setLoading(false)
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
    <form onSubmit={handleSubmit} className="space-y-8">
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
          disabled={loading}
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
              disabled={loading}
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
          disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
          disabled={loading}
          className="border-gray-200 focus:border-gray-400 resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4" />
          {t('projects.form.success')}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-gray-200"
            onClick={onCancel}
            disabled={loading}
          >
            {t('projects.form.cancel')}
          </Button>
        )}
        <Button
          type="submit"
          className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          {t('projects.form.submit')}
        </Button>
      </div>
    </form>
  )
}
