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
  formatCurrency,
  formatCurrencyPrecise,
  getConsumptionColor,
  getConsumptionBgColor
} from "@/lib/project-finances"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Euro,
  Clock,
  Target,
  TrendingUp,
  Loader2,
  FileText,
  FileCheck,
  BarChart3,
  Briefcase,
  ArrowRight,
  FolderOpen
} from "lucide-react"

interface GlobalFinancesProps {
  onSelectProject?: (projectId: string) => void
}

// Color palette for charts
const COLORS = {
  primary: "#ea4c89",
  secondary: "#6366f1",
  budget: "#94a3b8",
  consumed: "#ea4c89",
  remaining: "#22c55e",
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

        {/* Temps consommé */}
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget by Status */}
        {statusChartData.length > 0 && (
          <div className="bg-white border rounded-xl p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">
              {t('finances.byStatus')}
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      const data = payload[0].payload
                      return (
                        <div className="bg-white border rounded-lg shadow-lg p-3 text-sm">
                          <p className="font-medium mb-2">{label}</p>
                          <p className="text-muted-foreground">
                            Budget: {formatCurrency(data.budget)}
                          </p>
                          <p className="text-muted-foreground">
                            {data.count} projet(s)
                          </p>
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="budget" radius={[4, 4, 0, 0]}>
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Category Breakdown (Pie) */}
        {categoryChartData.length > 0 && (
          <div className="bg-white border rounded-xl p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">
              {t('finances.categoryBreakdown')}
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const data = payload[0].payload
                      return (
                        <div className="bg-white border rounded-lg shadow-lg p-3 text-sm">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-muted-foreground">
                            {data.value.toFixed(1)} jours ({data.percent.toFixed(0)}%)
                          </p>
                        </div>
                      )
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Monthly Evolution Chart */}
      {monthlyChartData.length > 0 && (
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">
            {t('finances.monthlyEvolution')}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="bg-white border rounded-lg shadow-lg p-3 text-sm">
                        <p className="font-medium mb-2">{label}</p>
                        {payload.map((item: any, idx: number) => (
                          <p key={idx} className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: item.stroke }}
                            />
                            <span className="text-muted-foreground">{item.name}:</span>
                            <span className="font-medium">{item.value?.toFixed(1)} jours</span>
                          </p>
                        ))}
                      </div>
                    )
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  name={t('finances.cumulativeDays')}
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  dot={{ fill: COLORS.primary, strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="days"
                  name={t('finances.timeConsumed')}
                  stroke={COLORS.secondary}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: COLORS.secondary, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Project Breakdown Table */}
      {financeData.projectBreakdown.length > 0 && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-foreground">
              {t('finances.byProject')}
            </h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('finances.project')}</TableHead>
                <TableHead>{t('finances.client')}</TableHead>
                <TableHead>{t('finances.status')}</TableHead>
                <TableHead className="text-right">{t('finances.totalBudgetHT')}</TableHead>
                <TableHead className="text-right">{t('finances.consumedDays')}</TableHead>
                <TableHead className="text-right">{t('finances.consumption')}</TableHead>
                {onSelectProject && <TableHead></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {financeData.projectBreakdown.map(({ project, finances }) => {
                const clientName = project.profiles?.company_name ||
                  `${project.profiles?.first_name || ''} ${project.profiles?.last_name || ''}`.trim() ||
                  'Client'

                return (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      {project.title || 'Projet sans titre'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{clientName}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-foreground">
                        {STATUS_LABELS[project.status] || project.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(finances.totalBudgetHT)}
                    </TableCell>
                    <TableCell className="text-right">
                      {finances.consumedDays.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={getConsumptionColor(finances.consumptionPercent)}>
                        {finances.consumptionPercent.toFixed(0)}%
                      </span>
                    </TableCell>
                    {onSelectProject && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectProject(project.id)}
                          className="text-[#ea4c89] hover:text-[#ea4c89]/80"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
              {/* Total row */}
              <TableRow className="bg-muted/50 font-medium">
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell className="text-right">{formatCurrency(financeData.totalBudgetHT)}</TableCell>
                <TableCell className="text-right">{financeData.totalConsumedDays.toFixed(1)}</TableCell>
                <TableCell className="text-right">
                  <span className={getConsumptionColor(financeData.overallConsumptionPercent)}>
                    {financeData.overallConsumptionPercent.toFixed(0)}%
                  </span>
                </TableCell>
                {onSelectProject && <TableCell></TableCell>}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
