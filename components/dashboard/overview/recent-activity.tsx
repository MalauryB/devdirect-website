"use client"

import { MessageCircle, Receipt, Send } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/contexts/language-context"
import { getRowUrgencyColor, getTimeElapsedColor, getStatusBadgeClass, formatDate } from "@/lib/dashboard-utils"
import type { Project, Quote, Profile } from "@/lib/types"
import type { ActionType } from "@/lib/assignments"
import type { UrgencyLevel } from "@/lib/dashboard-utils"

export type ActionItem = {
  id: string
  type: 'message' | 'quote' | 'send'
  project: Project | null
  quote?: Quote
  notificationDate: string | null
  elapsed: { value: number; unit: 'min' | 'h' | 'j' } | null
  urgency: UrgencyLevel
  projectName: string
  clientName: string
  assignedTo?: string
  assignee?: Profile
}

interface RecentActivityProps {
  filteredItems: ActionItem[]
  engineers: Partial<Profile>[]
  unreadCounts: Record<string, number>
  assigningAction: string | null
  onNavigateToProject: (project: Project, subSection: 'messages' | 'quotes') => void
  onAssignAction: (
    actionType: ActionType,
    engineerId: string | null,
    projectId?: string,
    quoteId?: string
  ) => void
}

export function RecentActivity({
  filteredItems,
  engineers,
  unreadCounts,
  assigningAction,
  onNavigateToProject,
  onAssignAction,
}: RecentActivityProps) {
  const { t } = useLanguage()

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-10"></TableHead>
          <TableHead>{t('dashboard.engineer.actions.colAction')}</TableHead>
          <TableHead>{t('dashboard.engineer.actions.colProject')}</TableHead>
          <TableHead>{t('dashboard.engineer.actions.colClient')}</TableHead>
          <TableHead>{t('dashboard.engineer.actions.colAssigned')}</TableHead>
          <TableHead>{t('dashboard.engineer.actions.colDate')}</TableHead>
          <TableHead>{t('dashboard.engineer.actions.colProcessingTime')}</TableHead>
          <TableHead className="text-right">{t('dashboard.engineer.actions.colStatus')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredItems.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
              {t('dashboard.engineer.actions.noResults')}
            </TableCell>
          </TableRow>
        ) : (
          filteredItems.map((item) => (
            <TableRow
              key={item.id}
              onClick={() => {
                if (item.project) {
                  onNavigateToProject(item.project, item.type === 'message' ? 'messages' : 'quotes')
                }
              }}
              className={`cursor-pointer ${getRowUrgencyColor(item.urgency)}`}
            >
              <TableCell>
                {item.type === 'message' && <MessageCircle className="w-4 h-4 text-muted-foreground" />}
                {item.type === 'quote' && <Receipt className="w-4 h-4 text-[#ea4c89]" />}
                {item.type === 'send' && <Send className="w-4 h-4 text-slate-500" />}
              </TableCell>
              <TableCell className="font-medium">
                {item.type === 'message' && t('dashboard.engineer.actions.replyTo')}
                {item.type === 'quote' && t('dashboard.engineer.actions.createQuote')}
                {item.type === 'send' && t('dashboard.engineer.actions.sendQuote')}
              </TableCell>
              <TableCell className="text-muted-foreground">{item.projectName}</TableCell>
              <TableCell className="text-muted-foreground">{item.clientName}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <select
                  value={item.assignedTo || ''}
                  onChange={(e) => {
                    const engineerId = e.target.value || null
                    onAssignAction(
                      item.type as ActionType,
                      engineerId,
                      item.project?.id,
                      item.quote?.id
                    )
                  }}
                  disabled={assigningAction === `${item.type}-${item.project?.id || ''}-${item.quote?.id || ''}`}
                  className={`text-xs border rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 min-w-[100px] ${
                    assigningAction === `${item.type}-${item.project?.id || ''}-${item.quote?.id || ''}`
                      ? 'opacity-50 cursor-wait'
                      : 'cursor-pointer'
                  } ${item.assignedTo ? 'border-primary/30 text-primary' : 'border-border text-muted-foreground'}`}
                >
                  <option value="">{t('dashboard.engineer.actions.unassigned')}</option>
                  {engineers.map(eng => (
                    <option key={eng.id} value={eng.id}>
                      {eng.first_name && eng.last_name
                        ? `${eng.first_name} ${eng.last_name}`
                        : eng.first_name || eng.email}
                    </option>
                  ))}
                </select>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {item.notificationDate ? formatDate(item.notificationDate) : '-'}
              </TableCell>
              <TableCell>
                {item.elapsed && (
                  <span className={`text-xs px-2 py-1 rounded-full border ${getTimeElapsedColor(item.elapsed)}`}>
                    {item.elapsed.value} {item.elapsed.unit}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right">
                {item.type === 'message' && (
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                    {unreadCounts[item.project?.id || '']} msg
                  </span>
                )}
                {item.type === 'quote' && item.project && (
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(item.project.status)}`}>
                    {t(`projects.status.${item.project.status}`)}
                  </span>
                )}
                {item.type === 'send' && (
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                    {t('quotes.status.draft')}
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
