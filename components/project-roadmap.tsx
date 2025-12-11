"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/language-context"
import { Project, ProjectMilestone, MilestoneStatus, MilestoneSubtask, Profile } from "@/lib/types"
import {
  getProjectMilestones,
  createMilestone,
  updateMilestone,
  completeMilestone,
  uncompleteMilestone,
  deleteMilestone,
  createMilestones,
  deleteAllMilestones,
  getMilestoneStats,
  assignEngineerToMilestone,
  unassignEngineerFromMilestone,
  createSubtask,
  toggleSubtaskCompletion,
  deleteSubtask,
  createSubtasks,
  deleteAllSubtasks
} from "@/lib/milestones"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Loader2,
  Plus,
  Sparkles,
  MoreVertical,
  Pencil,
  Trash2,
  Check,
  Circle,
  Clock,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Calendar,
  RotateCcw,
  Users,
  ListTodo,
  X
} from "lucide-react"

interface ProjectRoadmapProps {
  project: Project
  currentUser: {
    id: string
    first_name?: string
    last_name?: string
    role?: string
  }
  isEngineer: boolean
  engineers?: Partial<Profile>[]
}

const STATUS_CONFIG: Record<MilestoneStatus, { icon: React.ReactNode; color: string; bgColor: string; label: string }> = {
  pending: {
    icon: <Circle className="w-4 h-4" />,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    label: 'roadmap.status.pending'
  },
  in_progress: {
    icon: <Clock className="w-4 h-4" />,
    color: 'text-[#ea4c89]',
    bgColor: 'bg-[#ea4c89]/10',
    label: 'roadmap.status.inProgress'
  },
  completed: {
    icon: <Check className="w-4 h-4" />,
    color: 'text-[#ea4c89]',
    bgColor: 'bg-[#ea4c89]/10',
    label: 'roadmap.status.completed'
  },
  blocked: {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'text-red-500',
    bgColor: 'bg-red-100',
    label: 'roadmap.status.blocked'
  }
}

export function ProjectRoadmap({ project, currentUser, isEngineer, engineers = [] }: ProjectRoadmapProps) {
  const { t } = useLanguage()
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([])
  const [stats, setStats] = useState<{ total: number; completed: number; progress: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<ProjectMilestone | null>(null)
  const [saving, setSaving] = useState(false)
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set())
  const [generatingSubtasks, setGeneratingSubtasks] = useState<string | null>(null)

  // Form state
  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formDueDate, setFormDueDate] = useState("")
  const [formStatus, setFormStatus] = useState<MilestoneStatus>("pending")

  // Subtask form state
  const [addingSubtaskTo, setAddingSubtaskTo] = useState<string | null>(null)
  const [subtaskTitle, setSubtaskTitle] = useState("")

  // Load milestones
  useEffect(() => {
    loadData()
  }, [project.id])

  const loadData = async () => {
    setLoading(true)
    const [milestonesResult, statsResult] = await Promise.all([
      getProjectMilestones(project.id),
      getMilestoneStats(project.id)
    ])
    setMilestones(milestonesResult.milestones)
    setStats(statsResult)
    setLoading(false)
  }

  const resetForm = () => {
    setFormTitle("")
    setFormDescription("")
    setFormDueDate("")
    setFormStatus("pending")
    setEditingMilestone(null)
  }

  const handleOpenAdd = () => {
    resetForm()
    setShowAddDialog(true)
  }

  const handleOpenEdit = (milestone: ProjectMilestone) => {
    setFormTitle(milestone.title)
    setFormDescription(milestone.description || "")
    setFormDueDate(milestone.due_date || "")
    setFormStatus(milestone.status)
    setEditingMilestone(milestone)
    setShowAddDialog(true)
  }

  const handleSave = async () => {
    if (!formTitle.trim()) return

    setSaving(true)

    if (editingMilestone) {
      const { error } = await updateMilestone(editingMilestone.id, {
        title: formTitle,
        description: formDescription || undefined,
        status: formStatus,
        due_date: formDueDate || null
      })

      if (!error) {
        await loadData()
        setShowAddDialog(false)
        resetForm()
      }
    } else {
      const { error } = await createMilestone(
        project.id,
        formTitle,
        formDescription || undefined,
        formDueDate || undefined,
        undefined,
        currentUser.id
      )

      if (!error) {
        await loadData()
        setShowAddDialog(false)
        resetForm()
      }
    }

    setSaving(false)
  }

  const handleToggleComplete = async (milestone: ProjectMilestone) => {
    if (milestone.status === 'completed') {
      await uncompleteMilestone(milestone.id, 'pending')
    } else {
      await completeMilestone(milestone.id, currentUser.id)
    }
    await loadData()
  }

  const handleStatusChange = async (milestone: ProjectMilestone, newStatus: MilestoneStatus) => {
    if (newStatus === 'completed') {
      await completeMilestone(milestone.id, currentUser.id)
    } else {
      await updateMilestone(milestone.id, { status: newStatus })
    }
    await loadData()
  }

  const handleDelete = async (milestoneId: string) => {
    const { error } = await deleteMilestone(milestoneId)
    if (!error) {
      await loadData()
    }
  }

  const handleGenerateWithAI = async () => {
    setGenerating(true)

    try {
      const response = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project })
      })

      if (!response.ok) {
        throw new Error('Failed to generate roadmap')
      }

      const data = await response.json()

      if (data.milestones && data.milestones.length > 0) {
        const { error } = await createMilestones(
          project.id,
          data.milestones,
          currentUser.id
        )

        if (!error) {
          await loadData()
        }
      }
    } catch (error) {
      console.error('Error generating roadmap:', error)
    }

    setGenerating(false)
  }

  const handleRegenerate = async () => {
    setShowRegenerateDialog(false)
    await deleteAllMilestones(project.id)
    await handleGenerateWithAI()
  }

  // Assignee handlers
  const handleAssignEngineer = async (milestoneId: string, engineerId: string) => {
    await assignEngineerToMilestone(milestoneId, engineerId, currentUser.id)
    await loadData()
  }

  const handleUnassignEngineer = async (milestoneId: string, engineerId: string) => {
    await unassignEngineerFromMilestone(milestoneId, engineerId)
    await loadData()
  }

  // Subtask handlers
  const handleAddSubtask = async (milestoneId: string) => {
    if (!subtaskTitle.trim()) return
    await createSubtask(milestoneId, subtaskTitle, undefined, currentUser.id)
    setSubtaskTitle("")
    setAddingSubtaskTo(null)
    await loadData()
  }

  const handleToggleSubtask = async (subtaskId: string) => {
    await toggleSubtaskCompletion(subtaskId, currentUser.id)
    await loadData()
  }

  const handleDeleteSubtask = async (subtaskId: string) => {
    await deleteSubtask(subtaskId)
    await loadData()
  }

  const handleGenerateSubtasks = async (milestone: ProjectMilestone) => {
    setGeneratingSubtasks(milestone.id)

    try {
      const response = await fetch('/api/generate-subtasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestone,
          projectContext: `${project.title}: ${project.description}`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate subtasks')
      }

      const data = await response.json()

      if (data.subtasks && data.subtasks.length > 0) {
        // Delete existing subtasks first
        await deleteAllSubtasks(milestone.id)
        // Create new ones
        await createSubtasks(milestone.id, data.subtasks, currentUser.id)
        // Expand the milestone to show subtasks
        setExpandedMilestones(prev => new Set([...prev, milestone.id]))
        await loadData()
      }
    } catch (error) {
      console.error('Error generating subtasks:', error)
    }

    setGeneratingSubtasks(null)
  }

  const toggleMilestoneExpanded = (milestoneId: string) => {
    setExpandedMilestones(prev => {
      const newSet = new Set(prev)
      if (newSet.has(milestoneId)) {
        newSet.delete(milestoneId)
      } else {
        newSet.add(milestoneId)
      }
      return newSet
    })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const isOverdue = (dueDate: string | null, status: MilestoneStatus) => {
    if (!dueDate || status === 'completed') return false
    return new Date(dueDate) < new Date()
  }

  const getSubtaskProgress = (subtasks: MilestoneSubtask[] | undefined) => {
    if (!subtasks || subtasks.length === 0) return null
    const completed = subtasks.filter(s => s.is_completed).length
    return { completed, total: subtasks.length, percent: Math.round((completed / subtasks.length) * 100) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-foreground/50" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{t('roadmap.title')}</h3>
          <p className="text-sm text-foreground/60">{t('roadmap.subtitle')}</p>
        </div>
        {isEngineer && (
          <div className="flex items-center gap-2">
            {milestones.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowRegenerateDialog(true)}
                disabled={generating}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                {t('roadmap.regenerate')}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleGenerateWithAI}
              disabled={generating}
              className="gap-2"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {t('roadmap.generateWithAI')}
            </Button>
            <Button onClick={handleOpenAdd} variant="outline" className="gap-2 border-[#ea4c89] text-foreground bg-white hover:bg-[#ea4c89]/5">
              <Plus className="w-4 h-4" />
              {t('roadmap.addMilestone')}
            </Button>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {stats && stats.total > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t('roadmap.progress')}</span>
            <span className="text-sm text-foreground/60">
              {stats.completed} / {stats.total} {t('roadmap.milestonesCompleted')}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#ea4c89] transition-all duration-500"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Milestones list */}
      {milestones.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <ChevronRight className="w-8 h-8 text-foreground/20" />
          </div>
          <h4 className="text-lg font-medium mb-2">{t('roadmap.noMilestones')}</h4>
          <p className="text-foreground/50 mb-4 max-w-md mx-auto">
            {t('roadmap.noMilestonesDescription')}
          </p>
          {isEngineer && (
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" onClick={handleGenerateWithAI} disabled={generating}>
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {t('roadmap.generateWithAI')}
              </Button>
              <Button onClick={handleOpenAdd} className="bg-action hover:bg-action/90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                {t('roadmap.addManually')}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {milestones.map((milestone) => {
            const statusConfig = STATUS_CONFIG[milestone.status]
            const overdue = isOverdue(milestone.due_date, milestone.status)
            const isExpanded = expandedMilestones.has(milestone.id)
            const subtaskProgress = getSubtaskProgress(milestone.subtasks)
            const hasSubtasks = milestone.subtasks && milestone.subtasks.length > 0

            return (
              <div
                key={milestone.id}
                className={`bg-white border rounded-xl transition-all ${
                  milestone.status === 'completed' ? 'border-[#ea4c89]/30 bg-[#ea4c89]/5' : 'border-gray-200'
                } ${overdue ? 'border-red-200' : ''}`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Expand/collapse button */}
                    <button
                      onClick={() => toggleMilestoneExpanded(milestone.id)}
                      className="mt-0.5 p-1 hover:bg-gray-100 rounded flex-shrink-0"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-foreground/50" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-foreground/50" />
                      )}
                    </button>

                    {/* Status indicator / checkbox */}
                    <button
                      onClick={() => isEngineer && handleToggleComplete(milestone)}
                      disabled={!isEngineer}
                      className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        milestone.status === 'completed'
                          ? 'bg-[#ea4c89] text-white'
                          : 'border-2 border-gray-300 hover:border-[#ea4c89]'
                      } ${!isEngineer ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      {milestone.status === 'completed' && <Check className="w-4 h-4" />}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className={`font-medium ${milestone.status === 'completed' ? 'line-through text-foreground/50' : ''}`}>
                            {milestone.title}
                          </h4>
                          {milestone.description && (
                            <p className={`text-sm mt-1 ${milestone.status === 'completed' ? 'text-foreground/40' : 'text-foreground/60'}`}>
                              {milestone.description}
                            </p>
                          )}
                        </div>

                        {/* Assignees */}
                        {isEngineer && engineers.length > 0 && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 flex-shrink-0">
                                {milestone.assignees && milestone.assignees.length > 0 ? (
                                  <div className="flex -space-x-2">
                                    {milestone.assignees.slice(0, 3).map((a) => (
                                      <div
                                        key={a.id}
                                        className="w-6 h-6 rounded-full bg-gradient-to-br from-[#e8c4c4] to-[#c48b8b] flex items-center justify-center overflow-hidden border-2 border-white"
                                        title={a.engineer ? `${a.engineer.first_name} ${a.engineer.last_name}` : ''}
                                      >
                                        {a.engineer?.avatar_url ? (
                                          <img
                                            src={a.engineer.avatar_url}
                                            alt=""
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <span className="text-[10px] font-bold text-white">
                                            {a.engineer?.first_name?.[0]?.toUpperCase() || '?'}
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                    {milestone.assignees.length > 3 && (
                                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white">
                                        <span className="text-[10px] font-medium text-foreground/70">
                                          +{milestone.assignees.length - 3}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <Users className="w-4 h-4 text-foreground/40" />
                                )}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-2" align="end">
                              <div className="text-sm font-medium mb-2">{t('roadmap.assignees')}</div>
                              <div className="space-y-1 max-h-48 overflow-y-auto">
                                {engineers.map((eng) => {
                                  const isAssigned = milestone.assignees?.some(a => a.engineer_id === eng.id)
                                  return (
                                    <button
                                      key={eng.id}
                                      onClick={() => {
                                        if (isAssigned) {
                                          handleUnassignEngineer(milestone.id, eng.id!)
                                        } else {
                                          handleAssignEngineer(milestone.id, eng.id!)
                                        }
                                      }}
                                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-sm transition-colors ${
                                        isAssigned ? 'bg-[#ea4c89]/10 text-[#ea4c89]' : 'hover:bg-gray-100'
                                      }`}
                                    >
                                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#e8c4c4] to-[#c48b8b] flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {eng.avatar_url ? (
                                          <img src={eng.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                          <span className="text-[10px] font-bold text-white">
                                            {eng.first_name?.[0]?.toUpperCase() || '?'}
                                          </span>
                                        )}
                                      </div>
                                      <span className="flex-1 truncate">{eng.first_name} {eng.last_name}</span>
                                      {isAssigned && <Check className="w-4 h-4 text-[#ea4c89]" />}
                                    </button>
                                  )
                                })}
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}

                        {/* Actions */}
                        {isEngineer && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1 hover:bg-gray-100 rounded flex-shrink-0">
                                <MoreVertical className="w-4 h-4 text-foreground/50" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenEdit(milestone)}>
                                <Pencil className="w-3 h-3 mr-2" />
                                {t('common.edit')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleGenerateSubtasks(milestone)}
                                disabled={generatingSubtasks === milestone.id}
                              >
                                {generatingSubtasks === milestone.id ? (
                                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                ) : (
                                  <Sparkles className="w-3 h-3 mr-2" />
                                )}
                                {t('roadmap.generateSubtasks')}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(milestone, 'pending')}
                                disabled={milestone.status === 'pending'}
                              >
                                <Circle className="w-3 h-3 mr-2" />
                                {t('roadmap.status.pending')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(milestone, 'in_progress')}
                                disabled={milestone.status === 'in_progress'}
                              >
                                <Clock className="w-3 h-3 mr-2" />
                                {t('roadmap.status.inProgress')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(milestone, 'completed')}
                                disabled={milestone.status === 'completed'}
                              >
                                <Check className="w-3 h-3 mr-2" />
                                {t('roadmap.status.completed')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(milestone, 'blocked')}
                                disabled={milestone.status === 'blocked'}
                              >
                                <AlertTriangle className="w-3 h-3 mr-2" />
                                {t('roadmap.status.blocked')}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(milestone.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-3 h-3 mr-2" />
                                {t('common.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>

                      {/* Meta info */}
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        {/* Status badge */}
                        {milestone.status !== 'pending' && milestone.status !== 'completed' && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${statusConfig.bgColor} ${statusConfig.color}`}>
                            {statusConfig.icon}
                            {t(statusConfig.label)}
                          </span>
                        )}

                        {/* Due date */}
                        {milestone.due_date && (
                          <span className={`inline-flex items-center gap-1 text-xs ${overdue ? 'text-red-500' : 'text-foreground/50'}`}>
                            <Calendar className="w-3 h-3" />
                            {formatDate(milestone.due_date)}
                            {overdue && <span className="font-medium">({t('roadmap.overdue')})</span>}
                          </span>
                        )}

                        {/* Subtask progress */}
                        {subtaskProgress && (
                          <span className="inline-flex items-center gap-1 text-xs text-foreground/50">
                            <ListTodo className="w-3 h-3" />
                            {subtaskProgress.completed}/{subtaskProgress.total} {t('roadmap.subtasks')}
                          </span>
                        )}

                        {/* Completed info */}
                        {milestone.status === 'completed' && milestone.completed_at && (
                          <span className="text-xs text-[#ea4c89]">
                            {t('roadmap.completedOn')} {formatDate(milestone.completed_at)}
                            {milestone.completer && (
                              <span> {t('roadmap.by')} {milestone.completer.first_name}</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded content: Subtasks */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
                    <div className="ml-12">
                      {/* Subtasks list */}
                      {hasSubtasks && (
                        <div className="space-y-2 mb-3">
                          {milestone.subtasks!.map((subtask) => (
                            <div
                              key={subtask.id}
                              className="flex items-center gap-3 group"
                            >
                              <button
                                onClick={() => isEngineer && handleToggleSubtask(subtask.id)}
                                disabled={!isEngineer}
                                className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors border-2 ${
                                  subtask.is_completed
                                    ? 'bg-[#ea4c89] border-[#ea4c89] text-white'
                                    : 'border-gray-300 hover:border-[#ea4c89]'
                                } ${!isEngineer ? 'cursor-default' : 'cursor-pointer'}`}
                              >
                                {subtask.is_completed && <Check className="w-3 h-3" />}
                              </button>
                              <span className={`flex-1 text-sm ${subtask.is_completed ? 'line-through text-foreground/40' : ''}`}>
                                {subtask.title}
                              </span>
                              {isEngineer && (
                                <button
                                  onClick={() => handleDeleteSubtask(subtask.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
                                >
                                  <X className="w-3 h-3 text-foreground/50" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add subtask */}
                      {isEngineer && (
                        addingSubtaskTo === milestone.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={subtaskTitle}
                              onChange={(e) => setSubtaskTitle(e.target.value)}
                              placeholder={t('roadmap.subtaskTitlePlaceholder')}
                              className="h-8 text-sm"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddSubtask(milestone.id)
                                if (e.key === 'Escape') {
                                  setAddingSubtaskTo(null)
                                  setSubtaskTitle("")
                                }
                              }}
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => handleAddSubtask(milestone.id)}
                              disabled={!subtaskTitle.trim()}
                              className="h-8"
                            >
                              {t('common.add')}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setAddingSubtaskTo(null)
                                setSubtaskTitle("")
                              }}
                              className="h-8"
                            >
                              {t('common.cancel')}
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAddingSubtaskTo(milestone.id)}
                            className="inline-flex items-center gap-1 text-sm text-foreground/50 hover:text-foreground transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            {t('roadmap.addSubtask')}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingMilestone ? t('roadmap.editMilestone') : t('roadmap.addMilestone')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label>{t('roadmap.milestoneTitle')}</Label>
              <Input
                placeholder={t('roadmap.milestoneTitlePlaceholder')}
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>{t('roadmap.milestoneDescription')}</Label>
              <Textarea
                placeholder={t('roadmap.milestoneDescriptionPlaceholder')}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Due date */}
            <div className="space-y-2">
              <Label>{t('roadmap.dueDate')}</Label>
              <Input
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
              />
            </div>

            {/* Status (only when editing) */}
            {editingMilestone && (
              <div className="space-y-2">
                <Label>{t('roadmap.status.label')}</Label>
                <Select value={formStatus} onValueChange={(v) => setFormStatus(v as MilestoneStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t('roadmap.status.pending')}</SelectItem>
                    <SelectItem value="in_progress">{t('roadmap.status.inProgress')}</SelectItem>
                    <SelectItem value="completed">{t('roadmap.status.completed')}</SelectItem>
                    <SelectItem value="blocked">{t('roadmap.status.blocked')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={saving || !formTitle.trim()}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editingMilestone ? t('common.save') : t('roadmap.addMilestone')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regenerate Confirmation Dialog */}
      <AlertDialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('roadmap.regenerateConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('roadmap.regenerateConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRegenerate}>
              {t('roadmap.regenerateConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
