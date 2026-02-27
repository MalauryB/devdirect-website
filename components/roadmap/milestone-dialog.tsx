"use client"

import { useLanguage } from "@/contexts/language-context"
import { ProjectMilestone, MilestoneStatus } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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

interface MilestoneDialogProps {
  open: boolean
  editingMilestone: ProjectMilestone | null
  formTitle: string
  formDescription: string
  formDueDate: string
  formStatus: MilestoneStatus
  saving: boolean
  onSave: () => void
  onClose: () => void
  setFormTitle: (value: string) => void
  setFormDescription: (value: string) => void
  setFormDueDate: (value: string) => void
  setFormStatus: (value: MilestoneStatus) => void
}

export function MilestoneDialog({
  open,
  editingMilestone,
  formTitle,
  formDescription,
  formDueDate,
  formStatus,
  saving,
  onSave,
  onClose,
  setFormTitle,
  setFormDescription,
  setFormDueDate,
  setFormStatus,
}: MilestoneDialogProps) {
  const { t } = useLanguage()

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
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
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={onSave} disabled={saving || !formTitle.trim()}>
            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {editingMilestone ? t('common.save') : t('roadmap.addMilestone')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
