"use client"

import { useLanguage } from "@/contexts/language-context"
import {
  BarChart,
  Bar,
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

// Color palette for charts
const COLORS = {
  budget: "#94a3b8",
  consumed: "#ea4c89",
}

interface ProfileChartDataItem {
  name: string
  budget: number
  consumed: number
  budgetAmount: number
  consumedAmount: number
}

interface CategoryChartDataItem {
  name: string
  value: number
  percent: number
  fill: string
}

interface CostBreakdownChartProps {
  profileChartData: ProfileChartDataItem[]
  categoryChartData: CategoryChartDataItem[]
}

export function CostBreakdownChart({
  profileChartData,
  categoryChartData
}: CostBreakdownChartProps) {
  const { t } = useLanguage()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Budget vs Consumed by Profile */}
      {profileChartData.length > 0 && (
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">
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
                            <span className="text-muted-foreground">{item.name}:</span>
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
  )
}
