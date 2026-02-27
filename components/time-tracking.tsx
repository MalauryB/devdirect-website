"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { TimeEntry, TimeEntryCategory } from "@/lib/types"
import {
  getProjectTimeEntries,
  getProjectTimeStats,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry
} from "@/lib/time-entries"
import { Loader2, Plus } from "lucide-react"
import { TimeStats, TimeStatsData } from "@/components/time-tracking/time-stats"
import { TimeEntryList } from "@/components/time-tracking/time-entry-list"
import { TimeEntryForm, TimeEntryFormData } from "@/components/time-tracking/time-entry-form"

interface TimeTrackingProps {
  projectId: string
  currentUser: {
    id: string
    first_name?: string
    last_name?: string
    role?: string
  }
  isEngineer: boolean
}

const CATEGORIES: { value: TimeEntryCategory; labelKey: string }[] = [
  { value: 'development', labelKey: 'timeTracking.categories.development' },
  { value: 'meeting', labelKey: 'timeTracking.categories.meeting' },
  { value: 'review', labelKey: 'timeTracking.categories.review' },
  { value: 'documentation', labelKey: 'timeTracking.categories.documentation' },
  { value: 'design', labelKey: 'timeTracking.categories.design' },
  { value: 'testing', labelKey: 'timeTracking.categories.testing' },
  { value: 'support', labelKey: 'timeTracking.categories.support' },
  { value: 'other', labelKey: 'timeTracking.categories.other' },
]

export function TimeTracking({ projectId, currentUser, isEngineer }: TimeTrackingProps) {
  const { t } = useLanguage()
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [stats, setStats] = useState<TimeStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [saving, setSaving] = useState(false)

  // Load entries and stats
  useEffect(() => {
    loadData()
  }, [projectId])

  const loadData = async () => {
    setLoading(true)
    const [entriesResult, statsResult] = await Promise.all([
      getProjectTimeEntries(projectId),
      getProjectTimeStats(projectId)
    ])
    setEntries(entriesResult.entries)
    setStats(statsResult)
    setLoading(false)
  }

  const handleOpenAdd = () => {
    setEditingEntry(null)
    setShowAddDialog(true)
  }

  const handleOpenEdit = (entry: TimeEntry) => {
    setEditingEntry(entry)
    setShowAddDialog(true)
  }

  const handleSave = async (data: TimeEntryFormData) => {
    setSaving(true)

    if (editingEntry) {
      // Update existing entry
      const { error } = await updateTimeEntry(editingEntry.id, {
        date: data.date,
        hours: data.hours,
        description: data.description,
        category: data.category as TimeEntryCategory || null
      })

      if (!error) {
        await loadData()
        setShowAddDialog(false)
        setEditingEntry(null)
      }
    } else {
      // Create new entry
      const { error } = await createTimeEntry(
        projectId,
        currentUser.id,
        data.date,
        data.hours,
        data.description,
        data.category as TimeEntryCategory || undefined
      )

      if (!error) {
        await loadData()
        setShowAddDialog(false)
        setEditingEntry(null)
      }
    }

    setSaving(false)
  }

  const handleDelete = async (entryId: string) => {
    const { error } = await deleteTimeEntry(entryId)
    if (!error) {
      await loadData()
    }
  }

  const getCategoryLabel = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category)
    return cat ? t(cat.labelKey) : category
  }

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      development: 'bg-blue-100 text-blue-700',
      meeting: 'bg-purple-100 text-purple-700',
      review: 'bg-yellow-100 text-yellow-700',
      documentation: 'bg-green-100 text-green-700',
      design: 'bg-pink-100 text-pink-700',
      testing: 'bg-orange-100 text-orange-700',
      support: 'bg-cyan-100 text-cyan-700',
      other: 'bg-muted text-foreground/70',
    }
    return colors[category] || colors.other
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
      {/* Header with add button (only for engineers) */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{t('timeTracking.title')}</h3>
          <p className="text-sm text-foreground/60">{t('timeTracking.subtitle')}</p>
        </div>
        {isEngineer && (
          <Button onClick={handleOpenAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            {t('timeTracking.addEntry')}
          </Button>
        )}
      </div>

      {/* Stats cards and monthly breakdown */}
      {stats && (
        <TimeStats
          stats={stats}
          getCategoryLabel={getCategoryLabel}
          getCategoryColor={getCategoryColor}
        />
      )}

      {/* Entries list */}
      <TimeEntryList
        entries={entries}
        currentUserId={currentUser.id}
        isEngineer={isEngineer}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onAdd={handleOpenAdd}
        getCategoryLabel={getCategoryLabel}
        getCategoryColor={getCategoryColor}
      />

      {/* Add/Edit Dialog */}
      <TimeEntryForm
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        editingEntry={editingEntry}
        saving={saving}
        onSave={handleSave}
      />
    </div>
  )
}
