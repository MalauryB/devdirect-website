"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/language-context"
import { TimeEntry, TimeEntryCategory } from "@/lib/types"
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
import { Loader2 } from "lucide-react"

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

export interface TimeEntryFormData {
  date: string
  hours: number
  description?: string
  category?: TimeEntryCategory | null
}

interface TimeEntryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingEntry: TimeEntry | null
  saving: boolean
  onSave: (data: TimeEntryFormData) => void
}

export function TimeEntryForm({ open, onOpenChange, editingEntry, saving, onSave }: TimeEntryFormProps) {
  const { t } = useLanguage()

  // Self-contained form state
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])
  const [formHours, setFormHours] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formCategory, setFormCategory] = useState<TimeEntryCategory | "">("")

  // Reset or populate form when dialog opens or editingEntry changes
  useEffect(() => {
    if (open) {
      if (editingEntry) {
        setFormDate(editingEntry.date)
        setFormHours(editingEntry.hours.toString())
        setFormDescription(editingEntry.description || "")
        setFormCategory(editingEntry.category || "")
      } else {
        setFormDate(new Date().toISOString().split('T')[0])
        setFormHours("")
        setFormDescription("")
        setFormCategory("")
      }
    }
  }, [open, editingEntry])

  const handleSave = () => {
    if (!formHours || parseFloat(formHours) <= 0) return

    onSave({
      date: formDate,
      hours: parseFloat(formHours),
      description: formDescription || undefined,
      category: formCategory as TimeEntryCategory || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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
  )
}
