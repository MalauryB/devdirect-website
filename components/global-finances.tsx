"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Project, Quote, ProjectContract } from "@/lib/types"
import { getAllProjects } from "@/lib/projects"
import { getQuotesByProject } from "@/lib/quotes"
import { getProjectContracts } from "@/lib/contracts"
import {
  calculateGlobalFinances,
  GlobalFinanceData
} from "@/lib/global-finances"
import {
  Loader2,
  BarChart3,
} from "lucide-react"
import { FinanceSummaryCards } from "@/components/finances/finance-summary-cards"
import { FinanceFilters } from "@/components/finances/finance-filters"

interface GlobalFinancesProps {
  onSelectProject?: (projectId: string) => void
}

// Color palette for charts
const COLORS = {
  primary: "#ea4c89",
  statuses: {
    pending: "#94a3b8",
    in_review: "#f59e0b",
    active: "#6366f1",
    won: "#22c55e",
    lost: "#ef4444",
    cancelled: "#9ca3af",
    closed: "#64748b"
  },
  categories: [
    "#ea4c89",
    "#6366f1",
    "#f59e0b",
    "#10b981",
    "#8b5cf6",
    "#ef4444",
    "#06b6d4",
    "#f97316",
  ]
}

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  in_review: "En étude",
  active: "Actif",
  won: "Remporté",
  lost: "Perdu",
  cancelled: "Annulé",
  closed: "Clos"
}

export function GlobalFinances({ onSelectProject }: GlobalFinancesProps) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [financeData, setFinanceData] = useState<GlobalFinanceData | null>(null)

  useEffect(() => {
    loadGlobalFinances()
  }, [])

  async function loadGlobalFinances() {
    setLoading(true)
    try {
      // Get all projects
      const { projects, error } = await getAllProjects()
      if (error || !projects) {
        console.error("Error loading projects:", error)
        setLoading(false)
        return
      }

      // Helper functions for fetching quotes and contracts
      const getQuotesForProject = async (projectId: string): Promise<Quote[]> => {
        const result = await getQuotesByProject(projectId)
        return result.quotes || []
      }

      const getContractsForProject = async (projectId: string): Promise<ProjectContract[]> => {
        return await getProjectContracts(projectId)
      }

      // Calculate global finances
      const data = await calculateGlobalFinances(
        projects,
        getQuotesForProject,
        getContractsForProject
      )
      setFinanceData(data)
    } catch (error) {
      console.error("Error loading global finances:", error)
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
          {t('finances.noGlobalData')}
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t('finances.noGlobalDataDescription')}
        </p>
      </div>
    )
  }

  // Prepare chart data
  const statusChartData = financeData.byStatus.map(s => ({
    name: STATUS_LABELS[s.status] || s.status,
    budget: s.budgetHT,
    count: s.count,
    fill: COLORS.statuses[s.status as keyof typeof COLORS.statuses] || COLORS.primary
  }))

  const categoryChartData = financeData.categoryTotals.map((cat, index) => ({
    name: cat.categoryLabel,
    value: cat.days,
    percent: cat.percent,
    fill: COLORS.categories[index % COLORS.categories.length]
  }))

  const monthlyChartData = financeData.monthlyTotals.map(month => ({
    name: month.monthLabel,
    days: month.daysWorked,
    cumulative: month.cumulativeDays
  }))

  return (
    <div className="space-y-6">
      <FinanceSummaryCards financeData={financeData} />

      <FinanceFilters
        financeData={financeData}
        statusChartData={statusChartData}
        categoryChartData={categoryChartData}
        monthlyChartData={monthlyChartData}
        onSelectProject={onSelectProject}
      />
    </div>
  )
}
