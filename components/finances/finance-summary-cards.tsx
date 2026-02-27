"use client"

import { useLanguage } from "@/contexts/language-context"
import { GlobalFinanceData } from "@/lib/global-finances"
import {
  formatCurrency,
  getConsumptionColor,
  getConsumptionBgColor,
} from "@/lib/project-finances"
import {
  Euro,
  Clock,
  Target,
  Briefcase,
  FileCheck,
  FileText,
} from "lucide-react"

interface FinanceSummaryCardsProps {
  financeData: GlobalFinanceData
}

export function FinanceSummaryCards({ financeData }: FinanceSummaryCardsProps) {
  const { t } = useLanguage()

  return (
    <>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Budget Total TTC */}
        <div className="bg-muted/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#ea4c89]/10 flex items-center justify-center">
              <Euro className="w-5 h-5 text-[#ea4c89]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">{t('finances.totalBudgetTTC')}</p>
              <p className="text-xl font-semibold text-foreground mt-1">
                {formatCurrency(financeData.totalBudgetTTC)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(financeData.totalBudgetHT)} HT
              </p>
            </div>
          </div>
        </div>

        {/* Temps consomme */}
        <div className="bg-muted/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">{t('finances.timeConsumed')}</p>
              <p className="text-xl font-semibold text-foreground mt-1">
                {financeData.totalConsumedDays.toFixed(1)} {t('finances.days')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {financeData.totalConsumedHours.toFixed(1)} {t('finances.hours')}
              </p>
            </div>
          </div>
        </div>

        {/* Taux de consommation */}
        <div className="bg-muted/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getConsumptionBgColor(financeData.overallConsumptionPercent)}`}>
              <Target className={`w-5 h-5 ${getConsumptionColor(financeData.overallConsumptionPercent)}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">{t('finances.consumptionRate')}</p>
              <p className={`text-xl font-semibold mt-1 ${getConsumptionColor(financeData.overallConsumptionPercent)}`}>
                {financeData.overallConsumptionPercent.toFixed(0)}%
              </p>
              <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                <div
                  className={`h-1.5 rounded-full ${financeData.overallConsumptionPercent >= 90 ? 'bg-red-500' : financeData.overallConsumptionPercent >= 75 ? 'bg-amber-500' : 'bg-[#ea4c89]'}`}
                  style={{ width: `${Math.min(100, financeData.overallConsumptionPercent)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Projets avec budget */}
        <div className="bg-muted/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">{t('finances.totalProjects')}</p>
              <p className="text-xl font-semibold text-foreground mt-1">
                {financeData.projectsWithBudget} / {financeData.totalProjects}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('finances.projectsWithBudget')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Source data info */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-[#ea4c89]" />
          <span>{financeData.totalAcceptedQuotes} {t('finances.acceptedQuotes')}</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-500" />
          <span>{financeData.totalSignedContracts} {t('finances.signedContracts')}</span>
        </div>
      </div>
    </>
  )
}
