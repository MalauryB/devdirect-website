"use client"

import { useLanguage } from "@/contexts/language-context"
import { Clock, Users, BarChart3 } from "lucide-react"

interface EngineerStat {
  engineerId: string
  engineerName: string
  hours: number
  days: number
}

interface CategoryStat {
  category: string
  hours: number
  days: number
}

interface MonthStat {
  month: string
  hours: number
  days: number
}

export interface TimeStatsData {
  totalHours: number
  totalDays: number
  byEngineer: EngineerStat[]
  byCategory: CategoryStat[]
  byMonth: MonthStat[]
}

interface TimeStatsProps {
  stats: TimeStatsData
  getCategoryLabel: (category: string) => string
  getCategoryColor: (category: string) => string
}

function formatMonth(monthStr: string) {
  const [year, month] = monthStr.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

export function TimeStats({ stats, getCategoryLabel, getCategoryColor }: TimeStatsProps) {
  const { t } = useLanguage()

  return (
    <>
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total time */}
        <div className="bg-muted/50 rounded-xl p-4">
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
        <div className="bg-muted/50 rounded-xl p-4">
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
        <div className="bg-muted/50 rounded-xl p-4">
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

      {/* Monthly breakdown */}
      {stats.byMonth.length > 0 && (
        <div className="bg-muted/50 rounded-xl p-4">
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
    </>
  )
}
