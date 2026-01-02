import { Project, Quote, ProjectContract } from './types'
import { calculateQuoteData } from './quote-export'
import { getProjectTimeStats } from './time-entries'
import { calculateProjectFinances, TimeStatsResult, ProjectFinanceData } from './project-finances'

// Project with finance data
export interface ProjectWithFinances {
  project: Project
  finances: ProjectFinanceData
}

// Global finance summary
export interface GlobalFinanceData {
  // Totals across all projects
  totalBudgetHT: number
  totalBudgetTVA: number
  totalBudgetTTC: number
  totalBudgetDays: number
  totalConsumedDays: number
  totalConsumedHours: number
  totalRemainingDays: number
  overallConsumptionPercent: number
  totalConsumedValueHT: number
  totalRemainingValueHT: number

  // Counts
  totalProjects: number
  projectsWithBudget: number
  totalAcceptedQuotes: number
  totalSignedContracts: number

  // By project breakdown
  projectBreakdown: ProjectWithFinances[]

  // By status
  byStatus: {
    status: string
    count: number
    budgetHT: number
    consumedDays: number
  }[]

  // Monthly totals (aggregated across all projects)
  monthlyTotals: {
    month: string
    monthLabel: string
    daysWorked: number
    cumulativeDays: number
  }[]

  // Category totals (aggregated across all projects)
  categoryTotals: {
    category: string
    categoryLabel: string
    days: number
    hours: number
    percent: number
  }[]

  hasData: boolean
}

const VAT_RATE = 0.20

// Month labels for display
function getMonthLabel(month: string): string {
  const [year, monthNum] = month.split('-')
  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
  return `${monthNames[parseInt(monthNum) - 1]} ${year.slice(2)}`
}

// Category labels for display
const CATEGORY_LABELS: Record<string, string> = {
  development: 'Développement',
  meeting: 'Réunions',
  review: 'Revue de code',
  documentation: 'Documentation',
  design: 'Design',
  testing: 'Tests',
  support: 'Support',
  other: 'Autre'
}

// Status labels for display
const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  in_review: 'En étude',
  active: 'Actif',
  won: 'Remporté',
  lost: 'Perdu',
  cancelled: 'Annulé',
  closed: 'Clos'
}

export async function calculateGlobalFinances(
  projects: Project[],
  getQuotesForProject: (projectId: string) => Promise<Quote[]>,
  getContractsForProject: (projectId: string) => Promise<ProjectContract[]>
): Promise<GlobalFinanceData> {
  // Calculate finances for each project
  const projectFinances: ProjectWithFinances[] = []

  for (const project of projects) {
    const [quotes, contracts, timeStatsResult] = await Promise.all([
      getQuotesForProject(project.id),
      getContractsForProject(project.id),
      getProjectTimeStats(project.id)
    ])

    const timeStats: TimeStatsResult = {
      totalHours: timeStatsResult.totalHours,
      totalDays: timeStatsResult.totalDays,
      byEngineer: timeStatsResult.byEngineer,
      byCategory: timeStatsResult.byCategory,
      byMonth: timeStatsResult.byMonth
    }

    const finances = calculateProjectFinances(quotes, contracts, timeStats)
    projectFinances.push({ project, finances })
  }

  // Aggregate totals
  let totalBudgetHT = 0
  let totalBudgetDays = 0
  let totalConsumedDays = 0
  let totalConsumedHours = 0
  let totalAcceptedQuotes = 0
  let totalSignedContracts = 0
  let projectsWithBudget = 0

  // Maps for aggregations
  const statusMap = new Map<string, { count: number; budgetHT: number; consumedDays: number }>()
  const monthlyMap = new Map<string, { daysWorked: number }>()
  const categoryMap = new Map<string, { days: number; hours: number }>()

  for (const { project, finances } of projectFinances) {
    totalBudgetHT += finances.totalBudgetHT
    totalBudgetDays += finances.totalBudgetDays
    totalConsumedDays += finances.consumedDays
    totalConsumedHours += finances.consumedHours
    totalAcceptedQuotes += finances.acceptedQuotesCount
    totalSignedContracts += finances.signedContractsCount

    if (finances.totalBudgetHT > 0) {
      projectsWithBudget++
    }

    // Aggregate by status
    const status = project.status
    const existing = statusMap.get(status) || { count: 0, budgetHT: 0, consumedDays: 0 }
    statusMap.set(status, {
      count: existing.count + 1,
      budgetHT: existing.budgetHT + finances.totalBudgetHT,
      consumedDays: existing.consumedDays + finances.consumedDays
    })

    // Aggregate monthly data
    for (const month of finances.monthlyEvolution) {
      const existingMonth = monthlyMap.get(month.month) || { daysWorked: 0 }
      monthlyMap.set(month.month, {
        daysWorked: existingMonth.daysWorked + month.daysWorked
      })
    }

    // Aggregate category data
    for (const cat of finances.categoryBreakdown) {
      const existingCat = categoryMap.get(cat.category) || { days: 0, hours: 0 }
      categoryMap.set(cat.category, {
        days: existingCat.days + cat.days,
        hours: existingCat.hours + cat.hours
      })
    }
  }

  // Calculate derived values
  const totalRemainingDays = Math.max(0, totalBudgetDays - totalConsumedDays)
  const overallConsumptionPercent = totalBudgetDays > 0
    ? Math.min(100, (totalConsumedDays / totalBudgetDays) * 100)
    : 0
  const avgDailyRate = totalBudgetDays > 0 ? totalBudgetHT / totalBudgetDays : 0
  const totalConsumedValueHT = totalConsumedDays * avgDailyRate
  const totalRemainingValueHT = Math.max(0, totalBudgetHT - totalConsumedValueHT)

  // Build status breakdown
  const byStatus = Array.from(statusMap.entries())
    .map(([status, data]) => ({
      status,
      statusLabel: STATUS_LABELS[status] || status,
      ...data
    }))
    .sort((a, b) => b.budgetHT - a.budgetHT)

  // Build monthly totals with cumulative
  const sortedMonths = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))

  let cumulative = 0
  const monthlyTotals = sortedMonths.map(([month, data]) => {
    cumulative += data.daysWorked
    return {
      month,
      monthLabel: getMonthLabel(month),
      daysWorked: data.daysWorked,
      cumulativeDays: cumulative
    }
  })

  // Build category totals
  const categoryTotals = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      categoryLabel: CATEGORY_LABELS[category] || category,
      days: data.days,
      hours: data.hours,
      percent: totalConsumedDays > 0 ? (data.days / totalConsumedDays) * 100 : 0
    }))
    .sort((a, b) => b.days - a.days)

  const hasData = projectFinances.some(pf => pf.finances.hasData)

  return {
    totalBudgetHT,
    totalBudgetTVA: totalBudgetHT * VAT_RATE,
    totalBudgetTTC: totalBudgetHT * (1 + VAT_RATE),
    totalBudgetDays,
    totalConsumedDays,
    totalConsumedHours,
    totalRemainingDays,
    overallConsumptionPercent,
    totalConsumedValueHT,
    totalRemainingValueHT,
    totalProjects: projects.length,
    projectsWithBudget,
    totalAcceptedQuotes,
    totalSignedContracts,
    projectBreakdown: projectFinances
      .filter(pf => pf.finances.hasData)
      .sort((a, b) => b.finances.totalBudgetHT - a.finances.totalBudgetHT),
    byStatus,
    monthlyTotals,
    categoryTotals,
    hasData
  }
}
