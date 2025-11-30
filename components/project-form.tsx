"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"
import { createProject } from "@/lib/projects"
import { ProjectType, ProjectFormData } from "@/lib/types"
import { Loader2, Check } from "lucide-react"

interface ProjectFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProjectForm({ onSuccess, onCancel }: ProjectFormProps) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [projectType, setProjectType] = useState<ProjectType>("web")
  const [budgetMin, setBudgetMin] = useState("")
  const [budgetMax, setBudgetMax] = useState("")
  const [deadline, setDeadline] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!title.trim()) {
      setError(t('projects.errors.titleRequired'))
      return
    }

    if (!description.trim()) {
      setError(t('projects.errors.descriptionRequired'))
      return
    }

    setLoading(true)

    const formData: ProjectFormData = {
      title: title.trim(),
      description: description.trim(),
      project_type: projectType,
      budget_min: budgetMin ? parseInt(budgetMin) : undefined,
      budget_max: budgetMax ? parseInt(budgetMax) : undefined,
      deadline: deadline || undefined,
    }

    const { error: createError } = await createProject(formData)

    if (createError) {
      setError(t('projects.errors.createFailed'))
    } else {
      setSuccess(true)
      setTitle("")
      setDescription("")
      setProjectType("web")
      setBudgetMin("")
      setBudgetMax("")
      setDeadline("")
      setTimeout(() => {
        setSuccess(false)
        onSuccess?.()
      }, 1500)
    }

    setLoading(false)
  }

  const projectTypes: { value: ProjectType; labelKey: string }[] = [
    { value: "web", labelKey: "services.webDev.title" },
    { value: "mobile", labelKey: "services.mobileDev.title" },
    { value: "iot", labelKey: "services.iot.title" },
    { value: "ai", labelKey: "services.ai.title" },
    { value: "consulting", labelKey: "services.consulting.title" },
    { value: "maintenance", labelKey: "services.maintenance.title" },
    { value: "design", labelKey: "services.design.title" },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="title" className="text-sm font-medium text-foreground">
          {t('projects.form.title')}
        </Label>
        <Input
          id="title"
          type="text"
          placeholder={t('projects.form.titlePlaceholder')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          className="border-gray-200 focus:border-gray-400"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="projectType" className="text-sm font-medium text-foreground">
          {t('projects.form.type')}
        </Label>
        <Select value={projectType} onValueChange={(v) => setProjectType(v as ProjectType)} disabled={loading}>
          <SelectTrigger className="border-gray-200 focus:border-gray-400">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {projectTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {t(type.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="description" className="text-sm font-medium text-foreground">
          {t('projects.form.description')}
        </Label>
        <Textarea
          id="description"
          placeholder={t('projects.form.descriptionPlaceholder')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          className="border-gray-200 focus:border-gray-400 min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="budgetMin" className="text-sm font-medium text-foreground">
            {t('projects.form.budgetMin')}
          </Label>
          <Input
            id="budgetMin"
            type="number"
            placeholder="1000"
            value={budgetMin}
            onChange={(e) => setBudgetMin(e.target.value)}
            disabled={loading}
            className="border-gray-200 focus:border-gray-400"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="budgetMax" className="text-sm font-medium text-foreground">
            {t('projects.form.budgetMax')}
          </Label>
          <Input
            id="budgetMax"
            type="number"
            placeholder="5000"
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
            disabled={loading}
            className="border-gray-200 focus:border-gray-400"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="deadline" className="text-sm font-medium text-foreground">
          {t('projects.form.deadline')}
        </Label>
        <Input
          id="deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          disabled={loading}
          className="border-gray-200 focus:border-gray-400"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-green-600 bg-green-50 p-2 rounded-md flex items-center gap-2">
          <Check className="w-4 h-4" />
          {t('projects.form.success')}
        </p>
      )}

      <div className="flex gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
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
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {t('projects.form.submit')}
        </Button>
      </div>
    </form>
  )
}
