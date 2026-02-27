"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { Project, ProjectMilestone, MilestoneStatus, Profile } from "@/lib/types"
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
  Loader2,
  Plus,
  Sparkles,
  ChevronRight,
  RotateCcw,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { MilestoneCard } from "@/components/roadmap/milestone-card"
import { MilestoneDialog } from "@/components/roadmap/milestone-dialog"

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

export function ProjectRoadmap({ project, currentUser, isEngineer, engineers = [] }: ProjectRoadmapProps) {
  const { t } = useLanguage()
  const { session } = useAuth()
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
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
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
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
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
        <div className="bg-muted/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t('roadmap.progress')}</span>
            <span className="text-sm text-foreground/60">
              {stats.completed} / {stats.total} {t('roadmap.milestonesCompleted')}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-[#ea4c89] transition-all duration-500"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Milestones list */}
      {milestones.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
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
          {milestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              isEngineer={isEngineer}
              engineers={engineers}
              isExpanded={expandedMilestones.has(milestone.id)}
              generatingSubtasks={generatingSubtasks === milestone.id}
              addingSubtaskTo={addingSubtaskTo === milestone.id}
              subtaskTitle={addingSubtaskTo === milestone.id ? subtaskTitle : ""}
              onToggleExpand={() => toggleMilestoneExpanded(milestone.id)}
              onToggleComplete={() => handleToggleComplete(milestone)}
              onStatusChange={(status) => handleStatusChange(milestone, status)}
              onEdit={() => handleOpenEdit(milestone)}
              onDelete={() => handleDelete(milestone.id)}
              onGenerateSubtasks={() => handleGenerateSubtasks(milestone)}
              onAssignEngineer={(engineerId) => handleAssignEngineer(milestone.id, engineerId)}
              onUnassignEngineer={(engineerId) => handleUnassignEngineer(milestone.id, engineerId)}
              onAddSubtask={() => handleAddSubtask(milestone.id)}
              onToggleSubtask={handleToggleSubtask}
              onDeleteSubtask={handleDeleteSubtask}
              setSubtaskTitle={setSubtaskTitle}
              setAddingSubtaskTo={(adding) => {
                if (adding) {
                  setAddingSubtaskTo(milestone.id)
                } else {
                  setAddingSubtaskTo(null)
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <MilestoneDialog
        open={showAddDialog}
        editingMilestone={editingMilestone}
        formTitle={formTitle}
        formDescription={formDescription}
        formDueDate={formDueDate}
        formStatus={formStatus}
        saving={saving}
        onSave={handleSave}
        onClose={() => setShowAddDialog(false)}
        setFormTitle={setFormTitle}
        setFormDescription={setFormDescription}
        setFormDueDate={setFormDueDate}
        setFormStatus={setFormStatus}
      />

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
