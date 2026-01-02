"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Project, Quote, ProjectContract } from "@/lib/types"
import { getQuotesByProject } from "@/lib/quotes"
import { getProjectContracts } from "@/lib/contracts"
import { getProjectTimeStats } from "@/lib/time-entries"
import {
  calculateProjectFinances,
  formatCurrency,
  formatCurrencyPrecise,
  getConsumptionColor,
  getConsumptionBgColor,
  ProjectFinanceData,
  TimeStatsResult
} from "@/lib/project-finances"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
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
import {
  Euro,
  Clock,
  Target,
  TrendingUp,
  Loader2,
  FileText,
  FileCheck,
  BarChart3,
  PieChartIcon,
  AlertTriangle
} from "lucide-react"

interface ProjectFinancesProps {
  project: Project
  isEngineer: boolean
  onNavigateToContracts?: () => void
}

// Color palette for charts
const COLORS = {
  primary: "#ea4c89",
  secondary: "#6366f1",
  budget: "#94a3b8",
  consumed: "#ea4c89",
  remaining: "#22c55e",
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
    } catch (error) {
      console.error("Error loading finance data:", error)
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
        <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('finances.noData')}
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
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
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Budget Total TTC */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#ea4c89]/10 flex items-center justify-center">
              <Euro className="w-5 h-5 text-[#ea4c89]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500">{t('finances.totalBudgetTTC')}</p>
              <p className="text-xl font-semibold text-gray-900 mt-1">
                {formatCurrency(financeData.totalBudgetTTC)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatCurrency(financeData.totalBudgetHT)} HT
              </p>
            </div>
          </div>
        </div>

        {/* Temps consommé */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500">{t('finances.timeConsumed')}</p>
              <p className="text-xl font-semibold text-gray-900 mt-1">
                {financeData.consumedDays.toFixed(1)} {t('finances.days')}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {financeData.consumedHours.toFixed(1)} {t('finances.hours')}
              </p>
            </div>
          </div>
        </div>

        {/* Taux de consommation */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getConsumptionBgColor(financeData.consumptionPercent)}`}>
              <Target className={`w-5 h-5 ${getConsumptionColor(financeData.consumptionPercent)}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500">{t('finances.consumptionRate')}</p>
              <p className={`text-xl font-semibold mt-1 ${getConsumptionColor(financeData.consumptionPercent)}`}>
                {financeData.consumptionPercent.toFixed(0)}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div
                  className={`h-1.5 rounded-full ${financeData.consumptionPercent >= 90 ? 'bg-red-500' : financeData.consumptionPercent >= 75 ? 'bg-amber-500' : 'bg-[#ea4c89]'}`}
                  style={{ width: `${Math.min(100, financeData.consumptionPercent)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Jours restants */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500">{t('finances.remainingDays')}</p>
              <p className="text-xl font-semibold text-gray-900 mt-1">
                {financeData.remainingDays.toFixed(1)} {t('finances.days')}
              </p>
              <p className="text-xs text-gray-400 mt-1">
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
      <div className="flex gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-[#ea4c89]" />
          <span>{financeData.acceptedQuotesCount} {t('finances.acceptedQuotes')}</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-500" />
          <span>{financeData.signedContractsCount} {t('finances.signedContracts')}</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget vs Consumed by Profile */}
        {profileChartData.length > 0 && (
          <div className="bg-white border rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('finances.budgetVsConsumed')}
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profileChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
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
                                style={{ backgroundColor: item.fill }}
                              />
                              <span className="text-gray-600">{item.name}:</span>
                              <span className="font-medium">{item.value?.toFixed(1)} jours</span>
                            </p>
                          ))}
                        </div>
                      )
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="budget"
                    name={t('finances.budget')}
                    fill={COLORS.budget}
                    radius={[0, 4, 4, 0]}
                  />
                  <Bar
                    dataKey="consumed"
                    name={t('finances.consumed')}
                    fill={COLORS.consumed}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Category Breakdown (Pie) */}
        {categoryChartData.length > 0 && (
          <div className="bg-white border rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
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
                          <p className="text-gray-600">
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
          <h3 className="text-lg font-medium text-gray-900 mb-4">
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
                            <span className="text-gray-600">{item.name}:</span>
                            <span className="font-medium">
                              {item.dataKey === 'percent'
                                ? `${item.value?.toFixed(0)}%`
                                : `${item.value?.toFixed(1)} jours`}
                            </span>
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

      {/* Profile Breakdown Table */}
      {financeData.profileBreakdown.length > 0 && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">
              {t('finances.profileBreakdown')}
            </h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('finances.profile')}</TableHead>
                <TableHead className="text-right">{t('finances.dailyRate')}</TableHead>
                <TableHead className="text-right">{t('finances.budgetDays')}</TableHead>
                <TableHead className="text-right">{t('finances.consumedDays')}</TableHead>
                <TableHead className="text-right">{t('finances.remaining')}</TableHead>
                <TableHead className="text-right">{t('finances.consumption')}</TableHead>
                <TableHead className="text-right">{t('finances.amount')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {financeData.profileBreakdown.map((profile, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{profile.profileName}</TableCell>
                  <TableCell className="text-right">
                    {profile.dailyRate > 0 ? formatCurrencyPrecise(profile.dailyRate) : '-'}
                  </TableCell>
                  <TableCell className="text-right">{profile.budgetDays.toFixed(1)}</TableCell>
                  <TableCell className="text-right">{profile.consumedDays.toFixed(1)}</TableCell>
                  <TableCell className="text-right">{profile.remainingDays.toFixed(1)}</TableCell>
                  <TableCell className="text-right">
                    <span className={getConsumptionColor(profile.consumptionPercent)}>
                      {profile.consumptionPercent.toFixed(0)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {profile.budgetAmount > 0 ? formatCurrency(profile.budgetAmount) : '-'}
                  </TableCell>
                </TableRow>
              ))}
              {/* Total row */}
              <TableRow className="bg-gray-50 font-medium">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">-</TableCell>
                <TableCell className="text-right">{financeData.totalBudgetDays.toFixed(1)}</TableCell>
                <TableCell className="text-right">{financeData.consumedDays.toFixed(1)}</TableCell>
                <TableCell className="text-right">{financeData.remainingDays.toFixed(1)}</TableCell>
                <TableCell className="text-right">
                  <span className={getConsumptionColor(financeData.consumptionPercent)}>
                    {financeData.consumptionPercent.toFixed(0)}%
                  </span>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(financeData.totalBudgetHT)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
