"use client"

import { useLanguage } from "@/contexts/language-context"
import { GlobalFinanceData, ProjectWithFinances } from "@/lib/global-finances"
import {
  formatCurrency,
  getConsumptionColor,
} from "@/lib/project-finances"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
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
import { ArrowRight } from "lucide-react"

// Color palette for charts
const COLORS = {
  primary: "#ea4c89",
  secondary: "#6366f1",
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

interface StatusChartDataItem {
  name: string
  budget: number
  count: number
  fill: string
}

interface CategoryChartDataItem {
  name: string
  value: number
  percent: number
  fill: string
}

interface MonthlyChartDataItem {
  name: string
  days: number
  cumulative: number
}

interface FinanceFiltersProps {
  financeData: GlobalFinanceData
  statusChartData: StatusChartDataItem[]
  categoryChartData: CategoryChartDataItem[]
  monthlyChartData: MonthlyChartDataItem[]
  onSelectProject?: (projectId: string) => void
}

export function FinanceFilters({
  financeData,
  statusChartData,
  categoryChartData,
  monthlyChartData,
  onSelectProject
}: FinanceFiltersProps) {
  const { t } = useLanguage()

  return (
    <>
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
                        {payload.map((item, idx) => (
                          <p key={idx} className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: String(item.stroke || '') }}
                            />
                            <span className="text-muted-foreground">{String(item.name || '')}:</span>
                            <span className="font-medium">{Number(item.value || 0).toFixed(1)} jours</span>
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
                          aria-label="Voir le projet"
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
    </>
  )
}
