"use client"

import { Check, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"

interface StatsCardsProps {
  onNavigateToAllProjects: () => void
}

export function StatsCards({ onNavigateToAllProjects }: StatsCardsProps) {
  const { t } = useLanguage()

  return (
    <div className="bg-white border border-border rounded-xl p-8 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="font-semibold text-foreground mb-2">{t('dashboard.engineer.actions.allDone')}</h3>
      <p className="text-foreground/50 text-sm">{t('dashboard.engineer.actions.noActions')}</p>
      <Button
        onClick={onNavigateToAllProjects}
        variant="outline"
        className="mt-4"
      >
        {t('dashboard.engineer.viewAll')}
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  )
}
