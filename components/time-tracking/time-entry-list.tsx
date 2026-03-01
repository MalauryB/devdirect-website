"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { TimeEntry } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Clock, Calendar, MoreVertical, Pencil, Trash2 } from "lucide-react"

interface TimeEntryListProps {
  entries: TimeEntry[]
  currentUserId: string
  isEngineer: boolean
  onEdit: (entry: TimeEntry) => void
  onDelete: (entryId: string) => void
  onAdd: () => void
  getCategoryLabel: (category: string) => string
  getCategoryColor: (category: string) => string
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function TimeEntryList({
  entries,
  currentUserId,
  isEngineer,
  onEdit,
  onDelete,
  onAdd,
  getCategoryLabel,
  getCategoryColor,
}: TimeEntryListProps) {
  const { t } = useLanguage()

  return (
    <div>
      <h4 className="font-medium mb-3">{t('timeTracking.recentEntries')}</h4>
      {entries.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-xl">
          <Clock className="w-12 h-12 mx-auto text-foreground/20 mb-3" />
          <p className="text-foreground/50">{t('timeTracking.noEntries')}</p>
          {isEngineer && (
            <Button variant="outline" className="mt-3" onClick={onAdd}>
              <Plus className="w-4 h-4 mr-2" />
              {t('timeTracking.addFirstEntry')}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const isOwn = entry.engineer_id === currentUserId
            const engineerName = entry.engineer
              ? `${entry.engineer.first_name || ''} ${entry.engineer.last_name || ''}`.trim()
              : 'Inconnu'

            return (
              <div
                key={entry.id}
                className="bg-white border border-border rounded-lg p-4 flex items-center gap-4"
              >
                {/* Engineer avatar and name */}
                <div className="flex items-center gap-2 min-w-[140px]">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#e8c4c4] to-[#c48b8b] flex items-center justify-center overflow-hidden flex-shrink-0">
                    {entry.engineer?.avatar_url ? (
                      <img
                        src={entry.engineer.avatar_url}
                        alt={engineerName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-white">
                        {(entry.engineer?.first_name?.[0] || 'I').toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium truncate">
                    {isOwn ? 'Vous' : engineerName}
                  </span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 min-w-[110px]">
                  <Calendar className="w-4 h-4 text-foreground/40" />
                  <span className="text-sm">{formatDate(entry.date)}</span>
                </div>

                {/* Hours */}
                <div className="flex items-center gap-2 min-w-[70px]">
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

                {/* Actions (only for own entries) */}
                {isOwn && isEngineer && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 hover:bg-muted rounded" aria-label="Options de la saisie">
                        <MoreVertical className="w-4 h-4 text-foreground/50" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(entry)}>
                        <Pencil className="w-3 h-3 mr-2" />
                        {t('common.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(entry.id)}
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
  )
}
