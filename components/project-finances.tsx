"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Project, Quote, ProjectContract } from "@/lib/types"
import { getQuotesByProject } from "@/lib/quotes"
import { getProjectContracts } from "@/lib/contracts"
import { getProjectTimeStats } from "@/lib/time-entries"
import {
  calculateProjectFinances,
  ProjectFinanceData,
  TimeStatsResult
} from "@/lib/project-finances"
import {
  Loader2,
  BarChart3,
} from "lucide-react"
import { BudgetOverviewCards } from "@/components/finances/budget-overview-cards"
import { CostBreakdownChart } from "@/components/finances/cost-breakdown-chart"
import { TimeBreakdownChart } from "@/components/finances/time-breakdown-chart"

interface ProjectFinancesProps {
  project: Project
  isEngineer: boolean
  onNavigateToContracts?: () => void
}

// Color palette for charts
const COLORS = {
  categories: [
    "#ea4c89", // primary pink
    "#6366f1", // indigo
    "#f59e0b", // amber
    "#10b981", // emerald
    "#8b5cf6", // violet
    "#ef4444", // red
    "#06b6d4", // cyan
    "#f97316", // orange
  ]
}

export function ProjectFinances({ project, isEngineer, onNavigateToContracts }: ProjectFinancesProps) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [contractsWithoutProfiles, setContractsWithoutProfiles] = useState<ProjectContract[]>([])
  const [financeData, setFinanceData] = useState<ProjectFinanceData | null>(null)

  useEffect(() => {
    loadFinanceData()
  }, [project.id])

  async function loadFinanceData() {
    setLoading(true)
    try {
      // Fetch all required data in parallel
      const [quotesResult, contracts, timeStatsResult] = await Promise.all([
        getQuotesByProject(project.id),
        getProjectContracts(project.id),
        getProjectTimeStats(project.id)
      ])

      const quotes = quotesResult.quotes || []
      const timeStats: TimeStatsResult = {
        totalHours: timeStatsResult.totalHours,
        totalDays: timeStatsResult.totalDays,
        byEngineer: timeStatsResult.byEngineer,
        byCategory: timeStatsResult.byCategory,
        byMonth: timeStatsResult.byMonth
      }

      // Detect T&M contracts without profiles
      const tmContractsWithoutProfiles = contracts.filter(
        c => c.type === 'time_and_materials' &&
             c.status === 'signed' &&
             (!c.profiles || c.profiles.length === 0)
      )
      setContractsWithoutProfiles(tmContractsWithoutProfiles)

      // Calculate finance data
      const data = calculateProjectFinances(quotes, contracts, timeStats)
      setFinanceData(data)
    } catch {
      // Error handled by state
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#ea4c89]" />
      </div>
    )
  }

  if (!financeData || !financeData.hasData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          {t('finances.noData')}
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t('finances.noDataDescription')}
        </p>
      </div>
    )
  }

  // Prepare chart data
  const profileChartData = financeData.profileBreakdown.map(profile => ({
    name: profile.profileName,
    budget: profile.budgetDays,
    consumed: profile.consumedDays,
    budgetAmount: profile.budgetAmount,
    consumedAmount: profile.consumedAmount
  }))

  const categoryChartData = financeData.categoryBreakdown.map((cat, index) => ({
    name: cat.categoryLabel,
    value: cat.days,
    percent: cat.percent,
    fill: COLORS.categories[index % COLORS.categories.length]
  }))

  const monthlyChartData = financeData.monthlyEvolution.map(month => ({
    name: month.monthLabel,
    days: month.daysWorked,
    cumulative: month.cumulativeDays,
    percent: month.budgetConsumedPercent
  }))

  return (
    <div className="space-y-6">
      <BudgetOverviewCards
        financeData={financeData}
        contractsWithoutProfiles={contractsWithoutProfiles}
        onNavigateToContracts={onNavigateToContracts}
      />

      <CostBreakdownChart
        profileChartData={profileChartData}
        categoryChartData={categoryChartData}
      />

      <TimeBreakdownChart
        monthlyChartData={monthlyChartData}
        profileBreakdown={financeData.profileBreakdown}
        financeData={financeData}
      />
    </div>
  )
}
