"use client"

import { Filter } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import type { Profile } from "@/lib/types"

interface PendingActionsProps {
  actionTypeFilter: 'all' | 'message' | 'quote' | 'send'
  onActionTypeFilterChange: (value: 'all' | 'message' | 'quote' | 'send') => void
  projectFilter: string
  onProjectFilterChange: (value: string) => void
  clientFilter: string
  onClientFilterChange: (value: string) => void
  urgencyFilter: 'all' | 'critical' | 'high' | 'medium' | 'low'
  onUrgencyFilterChange: (value: 'all' | 'critical' | 'high' | 'medium' | 'low') => void
  assigneeFilter: string
  onAssigneeFilterChange: (value: string) => void
  engineers: Partial<Profile>[]
  uniqueProjects: string[]
  uniqueClients: string[]
  onClearFilters: () => void
}

export function PendingActions({
  actionTypeFilter,
  onActionTypeFilterChange,
  projectFilter,
  onProjectFilterChange,
  clientFilter,
  onClientFilterChange,
  urgencyFilter,
  onUrgencyFilterChange,
  assigneeFilter,
  onAssigneeFilterChange,
  engineers,
  uniqueProjects,
  uniqueClients,
  onClearFilters,
}: PendingActionsProps) {
  const { t } = useLanguage()

  const hasActiveFilters = projectFilter || clientFilter || urgencyFilter !== 'all' || assigneeFilter !== 'all'

  return (
    <div className="p-4 border-b border-border flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{t('dashboard.engineer.actions.title')}</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400"></span> {t('dashboard.engineer.actions.urgencyCritical')}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400"></span> {t('dashboard.engineer.actions.urgencyHigh')}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400"></span> {t('dashboard.engineer.actions.urgencyMedium')}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400"></span> {t('dashboard.engineer.actions.urgencyLow')}</span>
        </div>
      </div>
      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Filter className="w-4 h-4 text-muted-foreground" />
        </div>
        <select
          value={actionTypeFilter}
          onChange={(e) => onActionTypeFilterChange(e.target.value as 'all' | 'message' | 'quote' | 'send')}
          className="text-sm border border-border rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary/30"
        >
          <option value="all">{t('dashboard.engineer.actions.filterAll')}</option>
          <option value="message">{t('dashboard.engineer.actions.filterMessages')}</option>
          <option value="quote">{t('dashboard.engineer.actions.filterQuotes')}</option>
          <option value="send">{t('dashboard.engineer.actions.filterSend')}</option>
        </select>
        <input
          type="text"
          placeholder={t('dashboard.engineer.actions.filterByProject')}
          value={projectFilter}
          onChange={(e) => onProjectFilterChange(e.target.value)}
          className="text-sm border border-border rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 w-32"
          list="project-suggestions"
        />
        <datalist id="project-suggestions">
          {uniqueProjects.map(p => <option key={p} value={p} />)}
        </datalist>
        <input
          type="text"
          placeholder={t('dashboard.engineer.actions.filterByClient')}
          value={clientFilter}
          onChange={(e) => onClientFilterChange(e.target.value)}
          className="text-sm border border-border rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 w-32"
          list="client-suggestions"
        />
        <datalist id="client-suggestions">
          {uniqueClients.map(c => <option key={c} value={c} />)}
        </datalist>
        <select
          value={urgencyFilter}
          onChange={(e) => onUrgencyFilterChange(e.target.value as 'all' | 'critical' | 'high' | 'medium' | 'low')}
          className="text-sm border border-border rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary/30"
        >
          <option value="all">{t('dashboard.engineer.actions.filterUrgencyAll')}</option>
          <option value="critical">{t('dashboard.engineer.actions.urgencyCritical')}</option>
          <option value="high">{t('dashboard.engineer.actions.urgencyHigh')}</option>
          <option value="medium">{t('dashboard.engineer.actions.urgencyMedium')}</option>
          <option value="low">{t('dashboard.engineer.actions.urgencyLow')}</option>
        </select>
        <select
          value={assigneeFilter}
          onChange={(e) => onAssigneeFilterChange(e.target.value)}
          className="text-sm border border-border rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary/30"
        >
          <option value="all">{t('dashboard.engineer.actions.filterAssigneeAll')}</option>
          <option value="unassigned">{t('dashboard.engineer.actions.filterUnassigned')}</option>
          {engineers.map(eng => (
            <option key={eng.id} value={eng.id}>
              {eng.first_name && eng.last_name
                ? `${eng.first_name} ${eng.last_name}`
                : eng.first_name || eng.email}
            </option>
          ))}
        </select>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs text-muted-foreground hover:text-muted-foreground underline"
          >
            {t('dashboard.engineer.actions.clearFilters')}
          </button>
        )}
      </div>
    </div>
  )
}
