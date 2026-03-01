"use client"

import { useLanguage } from "@/contexts/language-context"
import { ProjectMilestone, MilestoneStatus, MilestoneSubtask, Profile } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  ListTodo,
  X
} from "lucide-react"
import { AssigneePopover } from "./assignee-popover"

const STATUS_CONFIG: Record<MilestoneStatus, { icon: React.ReactNode; color: string; bgColor: string; label: string }> = {
  pending: {
    icon: <Circle className="w-4 h-4" />,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
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

interface MilestoneCardProps {
  milestone: ProjectMilestone
  isEngineer: boolean
  engineers: Partial<Profile>[]
  isExpanded: boolean
  generatingSubtasks: boolean
  addingSubtaskTo: boolean
  subtaskTitle: string
  onToggleExpand: () => void
  onToggleComplete: () => void
  onStatusChange: (status: MilestoneStatus) => void
  onEdit: () => void
  onDelete: () => void
  onGenerateSubtasks: () => void
  onAssignEngineer: (engineerId: string) => void
  onUnassignEngineer: (engineerId: string) => void
  onAddSubtask: () => void
  onToggleSubtask: (subtaskId: string) => void
  onDeleteSubtask: (subtaskId: string) => void
  setSubtaskTitle: (title: string) => void
  setAddingSubtaskTo: (adding: boolean) => void
}

export function MilestoneCard({
  milestone,
  isEngineer,
  engineers,
  isExpanded,
  generatingSubtasks,
  addingSubtaskTo,
  subtaskTitle,
  onToggleExpand,
  onToggleComplete,
  onStatusChange,
  onEdit,
  onDelete,
  onGenerateSubtasks,
  onAssignEngineer,
  onUnassignEngineer,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  setSubtaskTitle,
  setAddingSubtaskTo,
}: MilestoneCardProps) {
  const { t } = useLanguage()

  const statusConfig = STATUS_CONFIG[milestone.status]
  const overdue = isOverdue(milestone.due_date, milestone.status)
  const subtaskProgress = getSubtaskProgress(milestone.subtasks)
  const hasSubtasks = milestone.subtasks && milestone.subtasks.length > 0

  return (
    <div
      className={`bg-white border rounded-xl transition-all ${
        milestone.status === 'completed' ? 'border-[#ea4c89]/30 bg-[#ea4c89]/5' : 'border-border'
      } ${overdue ? 'border-red-200' : ''}`}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Expand/collapse button */}
          <button
            onClick={onToggleExpand}
            className="mt-0.5 p-1 hover:bg-muted rounded flex-shrink-0"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-foreground/50" />
            ) : (
              <ChevronRight className="w-4 h-4 text-foreground/50" />
            )}
          </button>

          {/* Status indicator / checkbox */}
          <button
            onClick={() => isEngineer && onToggleComplete()}
            disabled={!isEngineer}
            className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
              milestone.status === 'completed'
                ? 'bg-[#ea4c89] text-white'
                : 'border-2 border-border hover:border-[#ea4c89]'
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
                <AssigneePopover
                  assignees={milestone.assignees}
                  engineers={engineers}
                  onAssign={onAssignEngineer}
                  onUnassign={onUnassignEngineer}
                />
              )}

              {/* Actions */}
              {isEngineer && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 hover:bg-muted rounded flex-shrink-0" aria-label="Options du jalon">
                      <MoreVertical className="w-4 h-4 text-foreground/50" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEdit}>
                      <Pencil className="w-3 h-3 mr-2" />
                      {t('common.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={onGenerateSubtasks}
                      disabled={generatingSubtasks}
                    >
                      {generatingSubtasks ? (
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3 mr-2" />
                      )}
                      {t('roadmap.generateSubtasks')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onStatusChange('pending')}
                      disabled={milestone.status === 'pending'}
                    >
                      <Circle className="w-3 h-3 mr-2" />
                      {t('roadmap.status.pending')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onStatusChange('in_progress')}
                      disabled={milestone.status === 'in_progress'}
                    >
                      <Clock className="w-3 h-3 mr-2" />
                      {t('roadmap.status.inProgress')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onStatusChange('completed')}
                      disabled={milestone.status === 'completed'}
                    >
                      <Check className="w-3 h-3 mr-2" />
                      {t('roadmap.status.completed')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onStatusChange('blocked')}
                      disabled={milestone.status === 'blocked'}
                    >
                      <AlertTriangle className="w-3 h-3 mr-2" />
                      {t('roadmap.status.blocked')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={onDelete}
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
        <div className="border-t border-muted px-4 py-3 bg-muted/50">
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
                      onClick={() => isEngineer && onToggleSubtask(subtask.id)}
                      disabled={!isEngineer}
                      className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors border-2 ${
                        subtask.is_completed
                          ? 'bg-[#ea4c89] border-[#ea4c89] text-white'
                          : 'border-border hover:border-[#ea4c89]'
                      } ${!isEngineer ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      {subtask.is_completed && <Check className="w-3 h-3" />}
                    </button>
                    <span className={`flex-1 text-sm ${subtask.is_completed ? 'line-through text-foreground/40' : ''}`}>
                      {subtask.title}
                    </span>
                    {isEngineer && (
                      <button
                        onClick={() => onDeleteSubtask(subtask.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-opacity"
                        aria-label="Supprimer la sous-tache"
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
              addingSubtaskTo ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={subtaskTitle}
                    onChange={(e) => setSubtaskTitle(e.target.value)}
                    placeholder={t('roadmap.subtaskTitlePlaceholder')}
                    className="h-8 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onAddSubtask()
                      if (e.key === 'Escape') {
                        setAddingSubtaskTo(false)
                        setSubtaskTitle("")
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={onAddSubtask}
                    disabled={!subtaskTitle.trim()}
                    className="h-8"
                  >
                    {t('common.add')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setAddingSubtaskTo(false)
                      setSubtaskTitle("")
                    }}
                    className="h-8"
                  >
                    {t('common.cancel')}
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingSubtaskTo(true)}
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
}

// Utility functions

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function isOverdue(dueDate: string | null, status: MilestoneStatus) {
  if (!dueDate || status === 'completed') return false
  return new Date(dueDate) < new Date()
}

function getSubtaskProgress(subtasks: MilestoneSubtask[] | undefined) {
  if (!subtasks || subtasks.length === 0) return null
  const completed = subtasks.filter(s => s.is_completed).length
  return { completed, total: subtasks.length, percent: Math.round((completed / subtasks.length) * 100) }
}
