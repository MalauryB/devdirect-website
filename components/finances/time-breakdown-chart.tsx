"use client"

import { useLanguage } from "@/contexts/language-context"
import {
  ProfileFinance,
  ProjectFinanceData,
  formatCurrency,
  formatCurrencyPrecise,
  getConsumptionColor,
} from "@/lib/project-finances"
import {
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

// Color palette for charts
const COLORS = {
  primary: "#ea4c89",
  secondary: "#6366f1",
}

interface MonthlyChartDataItem {
  name: string
  days: number
  cumulative: number
  percent: number
}

interface TimeBreakdownChartProps {
  monthlyChartData: MonthlyChartDataItem[]
  profileBreakdown: ProfileFinance[]
  financeData: ProjectFinanceData
}

export function TimeBreakdownChart({
  monthlyChartData,
  profileBreakdown,
  financeData
}: TimeBreakdownChartProps) {
  const { t } = useLanguage()

  return (
    <>
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
                              style={{ backgroundColor: item.stroke }}
                            />
                            <span className="text-muted-foreground">{item.name}:</span>
                            <span className="font-medium">
                              {item.dataKey === 'percent'
                                ? `${Number(item.value)?.toFixed(0)}%`
                                : `${Number(item.value)?.toFixed(1)} jours`}
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
      {profileBreakdown.length > 0 && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-foreground">
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
              {profileBreakdown.map((profile, index) => (
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
              <TableRow className="bg-muted/50 font-medium">
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
    </>
  )
}
