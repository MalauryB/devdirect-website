"use client"

import { useState, useCallback } from "react"
import { useLanguage } from "@/contexts/language-context"
import { getTimeElapsed, getUrgencyLevel } from "@/lib/dashboard-utils"
import type { Project, Quote, Profile } from "@/lib/types"
import type { ActionAssignment, ActionType } from "@/lib/assignments"
import { RecentActivity, type ActionItem } from "@/components/dashboard/overview/recent-activity"
import { PendingActions } from "@/components/dashboard/overview/pending-actions"
import { StatsCards } from "@/components/dashboard/overview/stats-cards"

interface EngineerOverviewProps {
  allProjects: Project[]
  allQuotes: Quote[]
  unreadCounts: Record<string, number>
  unreadOldestDates: Record<string, string>
  assignments: ActionAssignment[]
  engineers: Partial<Profile>[]
  onNavigateToProject: (project: Project, subSection: 'messages' | 'quotes') => void
  onNavigateToAllProjects: () => void
  onAssignAction: (actionType: ActionType, engineerId: string | null, projectId?: string, quoteId?: string) => Promise<void>
  onMarkAsHandled: (projectId: string) => Promise<void>
}

export function EngineerOverview({
  allProjects,
  allQuotes,
  unreadCounts,
  unreadOldestDates,
  assignments,
  engineers,
  onNavigateToProject,
  onNavigateToAllProjects,
  onAssignAction,
  onMarkAsHandled,
}: EngineerOverviewProps) {
  const { t } = useLanguage()

  // Internal filter state
  const [actionTypeFilter, setActionTypeFilter] = useState<'all' | 'message' | 'quote' | 'send'>('all')
  const [projectFilter, setProjectFilter] = useState<string>('')
  const [clientFilter, setClientFilter] = useState<string>('')
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')
  const [assigningAction, setAssigningAction] = useState<string | null>(null)
  const [markingAsHandled, setMarkingAsHandled] = useState<string | null>(null)

  // Helper to get assignment for an action
  const getActionAssignment = useCallback((
    actionType: ActionType,
    projectId?: string,
    quoteId?: string
  ): ActionAssignment | undefined => {
    return assignments.find(a =>
      a.action_type === actionType &&
      (projectId ? a.project_id === projectId : !a.project_id) &&
      (quoteId ? a.quote_id === quoteId : !a.quote_id)
    )
  }, [assignments])

  // Wrapper for assign action that tracks the assigning state
  const handleAssignAction = useCallback(async (
    actionType: ActionType,
    engineerId: string | null,
    projectId?: string,
    quoteId?: string
  ) => {
    const actionKey = `${actionType}-${projectId || ''}-${quoteId || ''}`
    setAssigningAction(actionKey)
    try {
      await onAssignAction(actionType, engineerId, projectId, quoteId)
    } finally {
      setAssigningAction(null)
    }
  }, [onAssignAction])

  // Exclude cancelled, lost, closed projects from all action calculations
  const excludedStatuses = ['cancelled', 'lost', 'closed']
  const activeProjects = allProjects.filter(p => !excludedStatuses.includes(p.status))

  // Calculate projects with unread messages (only from active projects)
  const projectsWithUnread = activeProjects.filter(p => unreadCounts[p.id] > 0)

  // Calculate projects needing quotes (pending/in_review without any quote, only from active projects)
  const projectsNeedingQuotes = activeProjects.filter(p =>
    (p.status === 'pending' || p.status === 'in_review') &&
    !allQuotes.some(q => q.project_id === p.id)
  )

  // Calculate draft quotes that need to be sent (only for active projects)
  const draftQuotes = allQuotes.filter(q => q.status === 'draft')
  const draftQuotesWithProjects = draftQuotes.map(q => ({
    quote: q,
    project: activeProjects.find(p => p.id === q.project_id)
  })).filter(item => item.project)

  const hasActions = projectsWithUnread.length > 0 || projectsNeedingQuotes.length > 0 || draftQuotesWithProjects.length > 0

  // Build unified action items list with urgency levels
  const actionItems: ActionItem[] = []

  // Add unread messages
  if (actionTypeFilter === 'all' || actionTypeFilter === 'message') {
    projectsWithUnread.forEach(project => {
      const notificationDate = unreadOldestDates[project.id]
      const elapsed = notificationDate ? getTimeElapsed(notificationDate) : null
      const urgency = elapsed ? getUrgencyLevel(elapsed) : 'low'
      const assignment = getActionAssignment('message', project.id)
      actionItems.push({
        id: `msg-${project.id}`,
        type: 'message',
        project,
        notificationDate,
        elapsed,
        urgency,
        projectName: project.title || t('projects.untitled'),
        clientName: project.profiles?.first_name || project.profiles?.company_name || '-',
        assignedTo: assignment?.assigned_to,
        assignee: assignment?.assignee
      })
    })
  }

  // Add projects needing quotes
  if (actionTypeFilter === 'all' || actionTypeFilter === 'quote') {
    projectsNeedingQuotes.forEach(project => {
      const notificationDate = project.created_at
      const elapsed = notificationDate ? getTimeElapsed(notificationDate) : null
      const urgency = elapsed ? getUrgencyLevel(elapsed) : 'low'
      const assignment = getActionAssignment('quote', project.id)
      actionItems.push({
        id: `quote-${project.id}`,
        type: 'quote',
        project,
        notificationDate,
        elapsed,
        urgency,
        projectName: project.title || t('projects.untitled'),
        clientName: project.profiles?.first_name || project.profiles?.company_name || '-',
        assignedTo: assignment?.assigned_to,
        assignee: assignment?.assignee
      })
    })
  }

  // Add draft quotes to send
  if (actionTypeFilter === 'all' || actionTypeFilter === 'send') {
    draftQuotesWithProjects.forEach(({ quote, project }) => {
      const notificationDate = quote.created_at
      const elapsed = notificationDate ? getTimeElapsed(notificationDate) : null
      const urgency = elapsed ? getUrgencyLevel(elapsed) : 'low'
      const assignment = getActionAssignment('send', project?.id, quote.id)
      actionItems.push({
        id: `draft-${quote.id}`,
        type: 'send',
        project: project || null,
        quote,
        notificationDate,
        elapsed,
        urgency,
        projectName: project?.title || t('projects.untitled'),
        clientName: project?.profiles?.first_name || project?.profiles?.company_name || '-',
        assignedTo: assignment?.assigned_to,
        assignee: assignment?.assignee
      })
    })
  }

  // Apply column filters
  const filteredItems = actionItems.filter(item => {
    // Project filter
    if (projectFilter && !item.projectName.toLowerCase().includes(projectFilter.toLowerCase())) {
      return false
    }
    // Client filter
    if (clientFilter && !item.clientName.toLowerCase().includes(clientFilter.toLowerCase())) {
      return false
    }
    // Urgency filter
    if (urgencyFilter !== 'all' && item.urgency !== urgencyFilter) {
      return false
    }
    // Assignee filter
    if (assigneeFilter !== 'all') {
      if (assigneeFilter === 'unassigned' && item.assignedTo) {
        return false
      }
      if (assigneeFilter !== 'unassigned' && item.assignedTo !== assigneeFilter) {
        return false
      }
    }
    return true
  })

  // Sort by urgency (critical first)
  const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  filteredItems.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])

  // Get unique values for filter dropdowns
  const uniqueProjects = [...new Set(actionItems.map(i => i.projectName))].filter(p => p !== '-')
  const uniqueClients = [...new Set(actionItems.map(i => i.clientName))].filter(c => c !== '-')

  const handleClearFilters = useCallback(() => {
    setProjectFilter('')
    setClientFilter('')
    setUrgencyFilter('all')
    setAssigneeFilter('all')
  }, [])

  return (
    <div className="w-full overflow-hidden">
      <h2 className="text-xl font-bold text-foreground mb-2">{t('dashboard.engineer.title')}</h2>
      <p className="text-foreground/60 mb-6">{t('dashboard.engineer.subtitle')}</p>

      {/* Actions to take */}
      <div className="space-y-6">
        {/* Detailed actions list - DataGrid */}
        {hasActions ? (
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <PendingActions
              actionTypeFilter={actionTypeFilter}
              onActionTypeFilterChange={setActionTypeFilter}
              projectFilter={projectFilter}
              onProjectFilterChange={setProjectFilter}
              clientFilter={clientFilter}
              onClientFilterChange={setClientFilter}
              urgencyFilter={urgencyFilter}
              onUrgencyFilterChange={setUrgencyFilter}
              assigneeFilter={assigneeFilter}
              onAssigneeFilterChange={setAssigneeFilter}
              engineers={engineers}
              uniqueProjects={uniqueProjects}
              uniqueClients={uniqueClients}
              onClearFilters={handleClearFilters}
            />
            <RecentActivity
              filteredItems={filteredItems}
              engineers={engineers}
              unreadCounts={unreadCounts}
              assigningAction={assigningAction}
              onNavigateToProject={onNavigateToProject}
              onAssignAction={handleAssignAction}
            />
          </div>
        ) : (
          <StatsCards onNavigateToAllProjects={onNavigateToAllProjects} />
        )}
      </div>
    </div>
  )
}
