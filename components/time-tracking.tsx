"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/language-context"
import { TimeEntry, TimeEntryCategory, Profile } from "@/lib/types"
import {
  getProjectTimeEntries,
  getProjectTimeStats,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry
} from "@/lib/time-entries"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Loader2, Plus, Clock, Calendar, MoreVertical, Pencil, Trash2, Users, BarChart3 } from "lucide-react"

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
  const [stats, setStats] = useState<{
    totalHours: number
    totalDays: number
    byEngineer: { engineerId: string; engineerName: string; hours: number; days: number }[]
    byCategory: { category: string; hours: number; days: number }[]
    byMonth: { month: string; hours: number; days: number }[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])
  const [formHours, setFormHours] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formCategory, setFormCategory] = useState<TimeEntryCategory | "">("")

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

  const resetForm = () => {
    setFormDate(new Date().toISOString().split('T')[0])
    setFormHours("")
    setFormDescription("")
    setFormCategory("")
    setEditingEntry(null)
  }

  const handleOpenAdd = () => {
    resetForm()
    setShowAddDialog(true)
  }

  const handleOpenEdit = (entry: TimeEntry) => {
    setFormDate(entry.date)
    setFormHours(entry.hours.toString())
    setFormDescription(entry.description || "")
    setFormCategory(entry.category || "")
    setEditingEntry(entry)
    setShowAddDialog(true)
  }

  const handleSave = async () => {
    if (!formHours || parseFloat(formHours) <= 0) return

    setSaving(true)

    if (editingEntry) {
      // Update existing entry
      const { error } = await updateTimeEntry(editingEntry.id, {
        date: formDate,
        hours: parseFloat(formHours),
        description: formDescription || undefined,
        category: formCategory as TimeEntryCategory || null
      })

      if (!error) {
        await loadData()
        setShowAddDialog(false)
        resetForm()
      }
    } else {
      // Create new entry
      const { error } = await createTimeEntry(
        projectId,
        currentUser.id,
        formDate,
        parseFloat(formHours),
        formDescription || undefined,
        formCategory as TimeEntryCategory || undefined
      )

      if (!error) {
        await loadData()
        setShowAddDialog(false)
        resetForm()
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
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
      other: 'bg-gray-100 text-gray-700',
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

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total time */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-foreground/60">{t('timeTracking.totalTime')}</p>
                <p className="text-2xl font-bold">{stats.totalHours.toFixed(1)}h</p>
              </div>
            </div>
            <p className="text-sm text-foreground/50">
              {stats.totalDays.toFixed(1)} {t('timeTracking.days')}
            </p>
          </div>

          {/* By engineer */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm text-foreground/60">{t('timeTracking.byEngineer')}</p>
            </div>
            <div className="space-y-2">
              {stats.byEngineer.length === 0 ? (
                <p className="text-sm text-foreground/40">{t('timeTracking.noEntries')}</p>
              ) : (
                stats.byEngineer.slice(0, 3).map((eng) => (
                  <div key={eng.engineerId} className="flex items-center justify-between text-sm">
                    <span className="truncate">{eng.engineerName}</span>
                    <span className="font-medium">{eng.hours.toFixed(1)}h</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* By category */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-foreground/60">{t('timeTracking.byCategory')}</p>
            </div>
            <div className="space-y-2">
              {stats.byCategory.length === 0 ? (
                <p className="text-sm text-foreground/40">{t('timeTracking.noEntries')}</p>
              ) : (
                stats.byCategory.slice(0, 3).map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getCategoryColor(cat.category)}`}>
                      {getCategoryLabel(cat.category)}
                    </span>
                    <span className="font-medium">{cat.hours.toFixed(1)}h</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Monthly breakdown */}
      {stats && stats.byMonth.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-medium mb-3">{t('timeTracking.byMonth')}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {stats.byMonth.map((month) => (
              <div key={month.month} className="bg-white rounded-lg p-3 text-center">
                <p className="text-xs text-foreground/50 capitalize">{formatMonth(month.month)}</p>
                <p className="text-lg font-semibold">{month.hours.toFixed(1)}h</p>
                <p className="text-xs text-foreground/40">{month.days.toFixed(1)}j</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Entries list */}
      <div>
        <h4 className="font-medium mb-3">{t('timeTracking.recentEntries')}</h4>
        {entries.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Clock className="w-12 h-12 mx-auto text-foreground/20 mb-3" />
            <p className="text-foreground/50">{t('timeTracking.noEntries')}</p>
            {isEngineer && (
              <Button variant="outline" className="mt-3" onClick={handleOpenAdd}>
                <Plus className="w-4 h-4 mr-2" />
                {t('timeTracking.addFirstEntry')}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => {
              const isOwn = entry.engineer_id === currentUser.id
              const engineerName = entry.engineer
                ? `${entry.engineer.first_name || ''} ${entry.engineer.last_name || ''}`.trim()
                : 'Inconnu'

              return (
                <div
                  key={entry.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4"
                >
                  {/* Date */}
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <Calendar className="w-4 h-4 text-foreground/40" />
                    <span className="text-sm">{formatDate(entry.date)}</span>
                  </div>

                  {/* Hours */}
                  <div className="flex items-center gap-2 min-w-[80px]">
                    <Clock className="w-4 h-4 text-foreground/40" />
                    <span className="font-medium">{Number(entry.hours).toFixed(1)}h</span>
                  </div>

                  {/* Category */}
                  {entry.category && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getCategoryColor(entry.category)}`}>
                      {getCategoryLabel(entry.category)}
                    </span>
                  )}

                  {/* Description */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground/70 truncate">
                      {entry.description || <span className="text-foreground/30 italic">{t('timeTracking.noDescription')}</span>}
                    </p>
                  </div>

                  {/* Engineer name (if not own) */}
                  {!isOwn && (
                    <span className="text-xs text-foreground/50 bg-gray-100 px-2 py-1 rounded">
                      {engineerName}
                    </span>
                  )}

                  {/* Actions (only for own entries) */}
                  {isOwn && isEngineer && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreVertical className="w-4 h-4 text-foreground/50" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEdit(entry)}>
                          <Pencil className="w-3 h-3 mr-2" />
                          {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-3 h-3 mr-2" />
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? t('timeTracking.editEntry') : t('timeTracking.addEntry')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Date */}
            <div className="space-y-2">
              <Label>{t('timeTracking.date')}</Label>
              <Input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
              />
            </div>

            {/* Hours */}
            <div className="space-y-2">
              <Label>{t('timeTracking.hours')}</Label>
              <Input
                type="number"
                min="0.25"
                max="24"
                step="0.25"
                placeholder="Ex: 2.5"
                value={formHours}
                onChange={(e) => setFormHours(e.target.value)}
              />
              <p className="text-xs text-foreground/50">{t('timeTracking.hoursHint')}</p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>{t('timeTracking.category')}</Label>
              <Select value={formCategory} onValueChange={(v) => setFormCategory(v as TimeEntryCategory)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('timeTracking.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {t(cat.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>{t('timeTracking.description')}</Label>
              <Textarea
                placeholder={t('timeTracking.descriptionPlaceholder')}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={saving || !formHours || parseFloat(formHours) <= 0}>
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {editingEntry ? t('common.save') : t('timeTracking.addEntry')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
