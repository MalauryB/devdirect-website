"use client"

import { useLanguage } from "@/contexts/language-context"
import { Profile, MilestoneAssignee } from "@/lib/types"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, Users } from "lucide-react"

interface AssigneePopoverProps {
  assignees: MilestoneAssignee[] | undefined
  engineers: Partial<Profile>[]
  onAssign: (engineerId: string) => void
  onUnassign: (engineerId: string) => void
}

export function AssigneePopover({ assignees, engineers, onAssign, onUnassign }: AssigneePopoverProps) {
  const { t } = useLanguage()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-muted flex-shrink-0">
          {assignees && assignees.length > 0 ? (
            <div className="flex -space-x-2">
              {assignees.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-[#e8c4c4] to-[#c48b8b] flex items-center justify-center overflow-hidden border-2 border-white"
                  title={a.engineer ? `${a.engineer.first_name} ${a.engineer.last_name}` : ''}
                >
                  {a.engineer?.avatar_url ? (
                    <img
                      src={a.engineer.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] font-bold text-white">
                      {a.engineer?.first_name?.[0]?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>
              ))}
              {assignees.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center border-2 border-white">
                  <span className="text-[10px] font-medium text-foreground/70">
                    +{assignees.length - 3}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <Users className="w-4 h-4 text-foreground/40" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="end">
        <div className="text-sm font-medium mb-2">{t('roadmap.assignees')}</div>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {engineers.map((eng) => {
            const isAssigned = assignees?.some(a => a.engineer_id === eng.id)
            return (
              <button
                key={eng.id}
                onClick={() => {
                  if (isAssigned) {
                    onUnassign(eng.id!)
                  } else {
                    onAssign(eng.id!)
                  }
                }}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-sm transition-colors ${
                  isAssigned ? 'bg-[#ea4c89]/10 text-[#ea4c89]' : 'hover:bg-muted'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#e8c4c4] to-[#c48b8b] flex items-center justify-center overflow-hidden flex-shrink-0">
                  {eng.avatar_url ? (
                    <img src={eng.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-white">
                      {eng.first_name?.[0]?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                <span className="flex-1 truncate">{eng.first_name} {eng.last_name}</span>
                {isAssigned && <Check className="w-4 h-4 text-[#ea4c89]" />}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
