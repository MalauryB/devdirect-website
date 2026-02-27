"use client"

import { useLanguage } from "@/contexts/language-context"
import { ProjectContract } from "@/lib/types"
import {
  ProjectFinanceData,
  formatCurrency,
  getConsumptionColor,
  getConsumptionBgColor,
} from "@/lib/project-finances"
import {
  Euro,
  Clock,
  Target,
  TrendingUp,
  FileCheck,
  FileText,
  AlertTriangle
} from "lucide-react"

interface BudgetOverviewCardsProps {
  financeData: ProjectFinanceData
  contractsWithoutProfiles: ProjectContract[]
  onNavigateToContracts?: () => void
}

export function BudgetOverviewCards({
  financeData,
  contractsWithoutProfiles,
  onNavigateToContracts
}: BudgetOverviewCardsProps) {
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
                {financeData.consumedDays.toFixed(1)} {t('finances.days')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {financeData.consumedHours.toFixed(1)} {t('finances.hours')}
              </p>
            </div>
          </div>
        </div>

        {/* Taux de consommation */}
        <div className="bg-muted/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getConsumptionBgColor(financeData.consumptionPercent)}`}>
              <Target className={`w-5 h-5 ${getConsumptionColor(financeData.consumptionPercent)}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">{t('finances.consumptionRate')}</p>
              <p className={`text-xl font-semibold mt-1 ${getConsumptionColor(financeData.consumptionPercent)}`}>
                {financeData.consumptionPercent.toFixed(0)}%
              </p>
              <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                <div
                  className={`h-1.5 rounded-full ${financeData.consumptionPercent >= 90 ? 'bg-red-500' : financeData.consumptionPercent >= 75 ? 'bg-amber-500' : 'bg-[#ea4c89]'}`}
                  style={{ width: `${Math.min(100, financeData.consumptionPercent)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Jours restants */}
        <div className="bg-muted/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">{t('finances.remainingDays')}</p>
              <p className="text-xl font-semibold text-foreground mt-1">
                {financeData.remainingDays.toFixed(1)} {t('finances.days')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(financeData.remainingValueHT)} HT
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Warning for T&M contracts without profiles */}
      {contractsWithoutProfiles.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-amber-800">
              {t('finances.contractsWithoutProfiles')}
            </p>
            <p className="text-sm text-amber-600 mt-1">
              {t('finances.contractsWithoutProfilesDescription')}
            </p>
            <ul className="mt-2 space-y-1">
              {contractsWithoutProfiles.map(contract => (
                <li key={contract.id} className="text-sm text-amber-700">
                  • {contract.title}
                </li>
              ))}
            </ul>
            {onNavigateToContracts && (
              <button
                onClick={onNavigateToContracts}
                className="mt-3 text-sm font-medium text-amber-800 hover:text-amber-900 underline"
              >
                {t('finances.goToContracts')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Source data info */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-[#ea4c89]" />
          <span>{financeData.acceptedQuotesCount} {t('finances.acceptedQuotes')}</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-500" />
          <span>{financeData.signedContractsCount} {t('finances.signedContracts')}</span>
        </div>
      </div>
    </>
  )
}
